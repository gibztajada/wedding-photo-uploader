-- Create table for the couple's main photo
CREATE TABLE IF NOT EXISTS couple_photo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE couple_photo ENABLE ROW LEVEL SECURITY;

-- Allow public to view the couple photo
CREATE POLICY "Allow public read access" ON couple_photo
  FOR SELECT USING (true);

-- Allow anyone with admin access to update (we'll rely on app-level auth)
CREATE POLICY "Allow inserts" ON couple_photo
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates" ON couple_photo
  FOR UPDATE USING (true);
