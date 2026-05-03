-- ================================================================
-- WANDERKIND · Waitlist table
-- Run once in Supabase Dashboard → SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT        NOT NULL,
  source        TEXT        NOT NULL DEFAULT 'landing-page',
  signed_up_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- Row-Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) may insert their own email — no read-back
CREATE POLICY "anon_insert"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (your admin session) may read
CREATE POLICY "auth_select"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);
