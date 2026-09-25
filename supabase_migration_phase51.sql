-- ==============================================================================
-- MTMC26 — Phase 51 Supabase Schema Migration: Events & Quarantined Content
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
-- Any verified student / moderator can view events
CREATE POLICY "events_select_verified" ON public.events
  FOR SELECT
  USING (
    public.get_my_status() = 'verified'
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

-- Verified users can submit events
CREATE POLICY "events_insert_verified" ON public.events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.get_my_status() = 'verified'
      OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
    )
  );

-- Authors and moderators can update events
CREATE POLICY "events_update_author_or_mod" ON public.events
  FOR UPDATE
  USING (
    auth.uid() = created_by_uid
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

-- Authors and moderators can delete events
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
-- Only moderators/admins and the author themselves can view quarantined content
CREATE POLICY "quarantine_select_mod_or_author" ON public.quarantined_content
  FOR SELECT
  USING (
    auth.uid() = author_id
    OR public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

-- Authenticated students can insert quarantined content (when flagged by safety check)
CREATE POLICY "quarantine_insert_authenticated" ON public.quarantined_content
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
  );

-- Only moderators can update or delete quarantined content (approve / reject)
CREATE POLICY "quarantine_modify_mod_only" ON public.quarantined_content
  FOR ALL
  USING (
    public.get_my_role() IN ('admin', 'supermod', 'moderator')
  );

-- 3. Add to Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quarantined_content;
