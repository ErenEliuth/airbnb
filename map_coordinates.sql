-- Run this in your Supabase SQL Editor to add coordinate columns to listings
-- This allows the map to store and retrieve the exact location

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS lat FLOAT8,
ADD COLUMN IF NOT EXISTS lng FLOAT8;
