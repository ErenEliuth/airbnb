-- Run this in your Supabase SQL Editor to add the missing columns

ALTER TABLE listings 
ADD COLUMN available_from DATE,
ADD COLUMN available_to DATE;
