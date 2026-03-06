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
  wa_message_id TEXT,
  wa_delivery_status TEXT DEFAULT 'none',
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

CREATE POLICY "Allow public insert"
  ON guests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete"
  ON guests FOR DELETE
  USING (true);

CREATE POLICY "Allow service role full access"
  ON guests FOR ALL
  USING (auth.role() = 'service_role');

-- WhatsApp tracking columns (run ALTER if table already exists)
-- ALTER TABLE guests ADD COLUMN IF NOT EXISTS wa_message_id TEXT;
-- ALTER TABLE guests ADD COLUMN IF NOT EXISTS wa_delivery_status TEXT DEFAULT 'none';

-- Message templates for admin-editable automated messages
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  whatsapp_text TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on templates"
  ON message_templates FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read on templates"
  ON message_templates FOR SELECT
  USING (true);

-- Seed default templates
INSERT INTO message_templates (id, email_subject, email_body, whatsapp_text) VALUES
(
  'rsvp_nudge',
  'You''re Invited: {{event_title}} - Please RSVP',
  'Dear {{first_name}},\n\nWe''d love to have you join us for {{event_title}}!\n\nPlease take a moment to let us know if you can make it.\n\n{{event_details}}\n\nRSVP here: {{rsvp_link}}',
  'Hi {{first_name}}! 🎉\n\nWe''d love to hear from you! You''re invited to *{{event_title}}*\n\n📅 {{event_date}}\n🕐 {{event_time}}\n📍 {{venue}}, {{address}}\n\nPlease RSVP: {{rsvp_link}}\n\nWith love,\nSaran, Usha & Rithika'
),
(
  'event_reminder',
  'Reminder: {{event_title}} is coming up!',
  'Dear {{first_name}},\n\nWe''re excited to see you at the ceremony!\n\n{{event_details}}\n\nGet Directions: {{maps_link}}\nView RSVP: {{rsvp_link}}',
  'Hi {{first_name}}! 🎉\n\nReminder: *{{event_title}}*\n\n📅 {{event_date}}\n🕐 {{event_time}}\n📍 {{venue}}, {{address}}\n\nWe look forward to seeing you!\n\n📍 Directions: {{maps_link}}\n🔗 Your RSVP: {{rsvp_link}}\n\nWith love,\nSaran, Usha & Rithika'
),
(
  'thank_you',
  'Thank You for Celebrating with Us! - {{event_title}}',
  'Dear {{first_name}},\n\nThank you so much for being part of {{event_title}}! Your presence made the day truly special.\n\nWe are grateful for your blessings and love.',
  'Hi {{first_name}}! 🙏\n\nThank you so much for being part of *{{event_title}}*! Your presence made the day truly special.\n\nWe are grateful for your blessings and love. 💛\n\nWith love,\nSaran, Usha & Rithika'
)
ON CONFLICT (id) DO NOTHING;
