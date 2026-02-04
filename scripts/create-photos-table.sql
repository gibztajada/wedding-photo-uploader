-- Create photos table for wedding gallery
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view all photos
CREATE POLICY "Allow public read access" ON photos
  FOR SELECT
  USING (true);

-- Allow anyone to insert photos
CREATE POLICY "Allow public insert" ON photos
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete photos
CREATE POLICY "Allow public delete" ON photos
  FOR DELETE
  USING (true);
