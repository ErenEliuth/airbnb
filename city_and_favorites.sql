-- Add city column to listings table (separate from location/address)
ALTER TABLE listings 
ADD COLUMN city VARCHAR(100);

-- Create favorites table for likes/hearts
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all favorites (for ranking)
CREATE POLICY "Anyone can view favorites" 
ON favorites FOR SELECT 
USING (true);

-- Policy: Users can add their own favorites
CREATE POLICY "Users can add favorites" 
ON favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own favorites
CREATE POLICY "Users can delete own favorites" 
ON favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_favorites_listing ON favorites(listing_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
