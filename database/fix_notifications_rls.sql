-- Ejecuta esto en tu Supabase SQL Editor:
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
