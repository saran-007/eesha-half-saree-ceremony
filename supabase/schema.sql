-- Eesha Half Saree Ceremony RSVP Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  invite_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  invite_sent_at TIMESTAMPTZ,
  invite_opened_at TIMESTAMPTZ,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'yes', 'no')),
  guest_count INTEGER DEFAULT 1,
  veg_count INTEGER DEFAULT 0,
  non_veg_count INTEGER DEFAULT 0,
  rsvp_responded_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_email
  ON guests(email) WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_mobile
  ON guests(mobile) WHERE mobile IS NOT NULL AND mobile != '';

CREATE INDEX IF NOT EXISTS idx_guests_invite_token ON guests(invite_token);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read by invite_token"
  ON guests FOR SELECT
  USING (true);

CREATE POLICY "Allow public update via token"
  ON guests FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access"
  ON guests FOR ALL
  USING (auth.role() = 'service_role');
