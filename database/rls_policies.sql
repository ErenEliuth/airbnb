-- Enable Row Level Security (RLS) on listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view listings (Public read access)
CREATE POLICY "Public listings are viewable by everyone" 
ON listings FOR SELECT 
USING (true);

-- Policy 2: Authenticated users can insert their own listings
CREATE POLICY "Users can create their own listings" 
ON listings FOR INSERT 
WITH CHECK (auth.uid() = host_id);

-- Policy 3: Users can update their own listings
CREATE POLICY "Users can update own listings" 
ON listings FOR UPDATE 
USING (auth.uid() = host_id);

-- Policy 4: Users can delete their own listings
CREATE POLICY "Users can delete own listings" 
ON listings FOR DELETE 
USING (auth.uid() = host_id);
