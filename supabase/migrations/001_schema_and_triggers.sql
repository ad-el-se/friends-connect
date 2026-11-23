-- =============================================================================
-- Friends Connect — Phase 3, Step 3.1 Migration
-- PostgreSQL 15+ Schema, PostGIS Spatial Indexing, Integrity Helpers,
-- Automated Triggers (ADR-001, ADR-003), and Guarded pg_cron Retention
--
-- Note: Row Level Security (RLS) policies and Storage buckets are intentionally
-- deferred to Step 3.2 (002_rls_and_storage.sql).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- -----------------------------------------------------------------------------
-- 2. Core Tables & Strict Relational Constraints (12 Tables in public)
-- -----------------------------------------------------------------------------

-- 2.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_path TEXT,
  bio TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  privacy_last_seen TEXT NOT NULL DEFAULT 'friends'
    CHECK (privacy_last_seen IN ('everyone', 'friends', 'nobody')),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,24}$')
);

-- 2.2 friend_requests
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id),
  CHECK (sender_id <> receiver_id)
);

-- 2.3 friendships (Canonical undirected pair: user_a < user_b)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

-- 2.4 blocked_users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

-- 2.5 conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  title TEXT,
  avatar_path TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 conversation_members
CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'member'
    CHECK (member_role IN ('owner', 'admin', 'member')),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  is_muted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- 2.7 messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'system')),
  content TEXT,
  attachment_path TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
  ON public.messages (conversation_id, created_at DESC);

-- 2.8 location_shares
CREATE TABLE IF NOT EXISTS public.location_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sharer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  precision TEXT NOT NULL DEFAULT 'exact'
    CHECK (precision IN ('exact', 'approximate')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sharer_id, viewer_id),
  CHECK (sharer_id <> viewer_id)
);

-- 2.9 live_locations (ADR-001: Single-row live state, zero historical trail)
CREATE TABLE IF NOT EXISTS public.live_locations (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  coords GEOGRAPHY(Point, 4326) NOT NULL,
  accuracy_meters REAL,
  battery_level SMALLINT CHECK (battery_level BETWEEN 0 AND 100),
  is_paused BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_locations_coords
  ON public.live_locations USING GIST (coords);

-- 2.10 device_tokens
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.11 reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reporter_id <> reported_user_id)
);

-- 2.12 audit_logs (Immutable admin moderation trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. Security & Integrity Helper Functions
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.are_friends(u1 UUID, u2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN u1 IS NULL OR u2 IS NULL OR u1 = u2 THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.friendships f
      WHERE f.user_a = LEAST(u1, u2)
        AND f.user_b = GREATEST(u1, u2)
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_blocked_either_way(u1 UUID, u2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN u1 IS NULL OR u2 IS NULL OR u1 = u2 THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.blocked_users b
      WHERE (b.blocker_id = u1 AND b.blocked_id = u2)
         OR (b.blocker_id = u2 AND b.blocked_id = u1)
    )
  END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Automated Database Triggers
-- -----------------------------------------------------------------------------

-- 4.1 Maintain updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Auto-create profile row on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_base TEXT;
  clean_base TEXT;
  short_suffix TEXT;
  candidate_username TEXT;
  final_display_name TEXT;
BEGIN
  short_suffix := substr(replace(NEW.id::text, '-', ''), 1, 6);

  raw_base := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'user'
  );

  clean_base := regexp_replace(lower(raw_base), '[^a-z0-9_]', '_', 'g');
  clean_base := regexp_replace(clean_base, '_+', '_', 'g');
  clean_base := trim(BOTH '_' FROM clean_base);

  IF length(clean_base) < 3 THEN
    clean_base := 'u_' || short_suffix;
  END IF;

  candidate_username := left(clean_base, 24);

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.username = candidate_username) THEN
    candidate_username := left(clean_base, 17) || '_' || short_suffix;
  END IF;

  final_display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    candidate_username
  );

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, candidate_username, final_display_name)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4.3 ADR-003 Automated Block Cascading
CREATE OR REPLACE FUNCTION public.handle_user_blocked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Atomically remove confirmed friendship in canonical order
  DELETE FROM public.friendships
  WHERE user_a = LEAST(NEW.blocker_id, NEW.blocked_id)
    AND user_b = GREATEST(NEW.blocker_id, NEW.blocked_id);

  -- 2. Cancel any pending or rejected friend requests in both directions
  DELETE FROM public.friend_requests
  WHERE (sender_id = NEW.blocker_id AND receiver_id = NEW.blocked_id)
     OR (sender_id = NEW.blocked_id AND receiver_id = NEW.blocker_id);

  -- 3. Immediately disable all active location shares in both directions
  UPDATE public.location_shares
  SET is_active = false
  WHERE (sharer_id = NEW.blocker_id AND viewer_id = NEW.blocked_id)
     OR (sharer_id = NEW.blocked_id AND viewer_id = NEW.blocker_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_blocked ON public.blocked_users;
CREATE TRIGGER on_user_blocked
  AFTER INSERT ON public.blocked_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_blocked();

-- 4.4 Rate-limit live_locations writes (max 1 coordinate update per 10 seconds),
--     while allowing instantaneous Privacy Kill-Switch toggles on is_paused.
CREATE OR REPLACE FUNCTION public.enforce_live_location_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.updated_at := COALESCE(NEW.updated_at, now());
    RETURN NEW;
  END IF;

  -- Instant bypass when toggling pause/kill-switch state
  IF OLD.is_paused IS DISTINCT FROM NEW.is_paused THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF now() - OLD.updated_at < interval '10 seconds' THEN
    RAISE EXCEPTION 'Rate limit exceeded: live_locations updates are limited to once every 10 seconds'
      USING ERRCODE = 'P0001';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_live_location_rate_limit ON public.live_locations;
CREATE TRIGGER enforce_live_location_rate_limit
  BEFORE INSERT OR UPDATE ON public.live_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_live_location_rate_limit();

-- -----------------------------------------------------------------------------
-- 5. Safe Retention Scheduling (pg_cron guarded block)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(j.jobid)
    FROM cron.job j
    WHERE j.jobname IN (
      'deactivate_expired_location_shares',
      'prune_stale_live_locations'
    );

    -- Job 1: Deactivate expired location shares every 15 minutes
    PERFORM cron.schedule(
      'deactivate_expired_location_shares',
      '*/15 * * * *',
      $job1$
        UPDATE public.location_shares
        SET is_active = false
        WHERE is_active = true
          AND expires_at IS NOT NULL
          AND expires_at <= now();
      $job1$
    );

    -- Job 2: Delete stale live_locations inactive for more than 24 hours
    PERFORM cron.schedule(
      'prune_stale_live_locations',
      '*/15 * * * *',
      $job2$
        DELETE FROM public.live_locations
        WHERE updated_at < now() - interval '24 hours';
      $job2$
    );
  END IF;
END;
$$;
