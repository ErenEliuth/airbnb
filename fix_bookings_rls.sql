-- Run this in your Supabase SQL Editor to allow updating bookings
CREATE POLICY "Hosts can update bookings for their listings" ON bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM listings WHERE listings.id = bookings.listing_id AND listings.host_id = auth.uid()));
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
