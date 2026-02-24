-- ══════════════════════════════════════════════════════
-- Ejecuta esto en el SQL Editor de Supabase
-- ══════════════════════════════════════════════════════

-- 1. Agregar columna de fechas bloqueadas a listings
--    (array de rangos JSON: [{from, to, booking_id}])
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS blocked_dates JSONB DEFAULT '[]'::jsonb;

-- 2. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL, -- 'booking_received' | 'booking_confirmed'
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
    listing_id  UUID REFERENCES listings(id) ON DELETE SET NULL,
    read        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS para notificaciones
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);
