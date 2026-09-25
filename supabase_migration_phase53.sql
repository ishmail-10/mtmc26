-- ==============================================================================
-- MTMC26 — Phase 53 Supabase Schema Migration: Events, Quarantine & Post Reports
-- Run this script in the Supabase SQL Editor (Project: bkdlqltpvfliktmimusl)
-- ==============================================================================

-- 1. Create 'events' table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'ceremony',
  category_label TEXT DEFAULT 'Batch Event',
  status TEXT DEFAULT 'completed',
  status_label TEXT DEFAULT '4K Gallery',
  date TEXT NOT NULL,
  date_mode TEXT DEFAULT 'single',
  venue TEXT DEFAULT 'MTMC Campus, Baridih',
  description TEXT,
  drive_album_url TEXT,
  drive_folder_id TEXT,
  cover_image TEXT,
  created_by_name TEXT,
  created_by_uid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events Policies:
DROP POLICY IF EXISTS "events_select_verified" ON public.events;
CREATE POLICY "events_select_verified" ON public.events
  FOR SELECT
  USING (
    public.get_my_status() = 'verified'
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

DROP POLICY IF EXISTS "events_insert_verified" ON public.events;
CREATE POLICY "events_insert_verified" ON public.events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.get_my_status() = 'verified'
      OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
    )
  );

DROP POLICY IF EXISTS "events_update_author_or_mod" ON public.events;
CREATE POLICY "events_update_author_or_mod" ON public.events
  FOR UPDATE
  USING (
    auth.uid() = created_by_uid
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

DROP POLICY IF EXISTS "events_delete_author_or_mod" ON public.events;
CREATE POLICY "events_delete_author_or_mod" ON public.events
  FOR DELETE
  USING (
    auth.uid() = created_by_uid
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );


-- 2. Create 'quarantined_content' table
CREATE TABLE IF NOT EXISTS public.quarantined_content (
  id TEXT PRIMARY KEY,
  item_type TEXT DEFAULT 'post', -- 'post' or 'comment'
  post_id TEXT,
  parent_id TEXT,
  board TEXT DEFAULT 'resources',
  title TEXT,
  content TEXT,
  price TEXT,
  tag TEXT,
  image_url TEXT,
  author_name TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_username TEXT,
  is_anon BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'quarantined',
  category TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on quarantined_content
ALTER TABLE public.quarantined_content ENABLE ROW LEVEL SECURITY;

-- Quarantined Content Policies:
DROP POLICY IF EXISTS "quarantine_select_mod_or_author" ON public.quarantined_content;
CREATE POLICY "quarantine_select_mod_or_author" ON public.quarantined_content
  FOR SELECT
  USING (
    auth.uid() = author_id
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

DROP POLICY IF EXISTS "quarantine_insert_authenticated" ON public.quarantined_content;
CREATE POLICY "quarantine_insert_authenticated" ON public.quarantined_content
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
  );

DROP POLICY IF EXISTS "quarantine_modify_mod_only" ON public.quarantined_content;
CREATE POLICY "quarantine_modify_mod_only" ON public.quarantined_content
  FOR ALL
  USING (
    public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );


-- 3. Create 'post_reports' table (for 1-report-per-user deduplication)
CREATE TABLE IF NOT EXISTS public.post_reports (
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Enable RLS on post_reports
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_reports_insert_verified" ON public.post_reports;
CREATE POLICY "post_reports_insert_verified" ON public.post_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "post_reports_select_mod_or_author" ON public.post_reports;
CREATE POLICY "post_reports_select_mod_or_author" ON public.post_reports
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

DROP POLICY IF EXISTS "post_reports_delete_mod" ON public.post_reports;
CREATE POLICY "post_reports_delete_mod" ON public.post_reports
  FOR DELETE
  USING (
    public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );


-- 4. Add to Supabase Realtime Publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quarantined_content;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reports;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 5. Add 'poll' column to 'posts' table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS poll JSONB DEFAULT NULL;


-- 6. Create 'mess_checkins' table (Who's Eating Now)
CREATE TABLE IF NOT EXISTS public.mess_checkins (
  date_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (date_key, user_id)
);

-- Enable RLS on mess_checkins
ALTER TABLE public.mess_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mess_checkins_select_all" ON public.mess_checkins;
CREATE POLICY "mess_checkins_select_all" ON public.mess_checkins FOR SELECT USING (true);

DROP POLICY IF EXISTS "mess_checkins_insert" ON public.mess_checkins;
CREATE POLICY "mess_checkins_insert" ON public.mess_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mess_checkins_delete" ON public.mess_checkins;
CREATE POLICY "mess_checkins_delete" ON public.mess_checkins FOR DELETE USING (auth.uid() = user_id);

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mess_checkins;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;


