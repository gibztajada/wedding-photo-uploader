-- Add DELETE policy to photos table
DROP POLICY IF EXISTS "Allow public delete" ON photos;
CREATE POLICY "Allow public delete" ON photos
  FOR DELETE
  USING (true);
