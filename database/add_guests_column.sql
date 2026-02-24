-- Run this in your Supabase SQL Editor to add the max_guests column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 1;
