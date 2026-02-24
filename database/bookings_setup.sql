-- ══════════════════════════════════════════════════════
-- 1. Add host_email column to listings (if not exists)
--    This lets us show the host's name without a profiles table
-- ══════════════════════════════════════════════════════
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS host_email TEXT;

-- ══════════════════════════════════════════════════════
-- 2. Create bookings table
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in      DATE NOT NULL,
    check_out     DATE NOT NULL,
    guests        INT NOT NULL DEFAULT 1,
    total_price   NUMERIC(12, 2) NOT NULL,
    status        TEXT NOT NULL DEFAULT 'confirmed',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 3. RLS for bookings
-- ══════════════════════════════════════════════════════
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bookings (but NOT for their own listing —
-- enforced in frontend; a DB check can be added via a trigger if needed)
CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can cancel (delete) own bookings
CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

-- Hosts can view bookings for their listings
CREATE POLICY "Hosts can view bookings for their listings"
ON bookings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM listings
        WHERE listings.id = bookings.listing_id
        AND listings.host_id = auth.uid()
    )
);
