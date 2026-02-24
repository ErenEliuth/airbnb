-- ══════════════════════════════════════════════════════
-- 1. Create reviews table
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment       TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure a user can only review a listing once
    UNIQUE(listing_id, user_id)
);

-- ══════════════════════════════════════════════════════
-- 2. RLS for reviews
-- ══════════════════════════════════════════════════════
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════
-- 3. Update listings view/trigger (Optional but good)
-- For now, we will calculate average rating in the frontend or 
-- via a select query.
-- ══════════════════════════════════════════════════════
