-- =============================================================================
-- Friends Connect — Phase 3, Step 3.2 Migration
-- Zero-Trust Row Level Security (RLS), Non-Recursive Security Helpers,
-- Private Storage Buckets & Object Policies, and Realtime Publication
--
-- Depends on: supabase/migrations/001_schema_and_triggers.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enable Default-Deny RLS & FORCE RLS on ALL 12 Public Tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships FORCE ROW LEVEL SECURITY;

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users FORCE ROW LEVEL SECURITY;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members FORCE ROW LEVEL SECURITY;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

ALTER TABLE public.location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_shares FORCE ROW LEVEL SECURITY;

ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_locations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens FORCE ROW LEVEL SECURITY;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Non-Recursive Security Helper Functions (SECURITY DEFINER)
-- -----------------------------------------------------------------------------

-- 2.1 Check whether a user has the global platform 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN uid IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = uid
        AND p.role = 'admin'
    )
  END;
$$;

-- 2.2 Check whether a user is a member of a conversation (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN conv_id IS NULL OR uid IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = conv_id
        AND cm.user_id = uid
    )
  END;
$$;

-- 2.3 Check whether a user is an owner or admin of a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_admin(conv_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN conv_id IS NULL OR uid IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = conv_id
        AND cm.user_id = uid
        AND cm.member_role IN ('owner', 'admin')
    )
  END;
$$;

-- 2.4 Check whether a direct conversation has a mutual block with the peer
CREATE OR REPLACE FUNCTION public.is_blocked_in_direct_conversation(conv_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN conv_id IS NULL OR uid IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.conversation_members cm
        ON cm.conversation_id = c.id
      WHERE c.id = conv_id
        AND c.type = 'direct'
        AND cm.user_id <> uid
        AND public.is_blocked_either_way(uid, cm.user_id)
    )
  END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Granular Table Policies (Idempotent DROP + CREATE)
-- -----------------------------------------------------------------------------

-- 3.1 public.profiles
DROP POLICY IF EXISTS "profiles_select_non_blocked" ON public.profiles;
CREATE POLICY "profiles_select_non_blocked"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR NOT public.is_blocked_either_way(auth.uid(), id)
  );

DROP POLICY IF EXISTS "profiles_update_own_no_role_escalation" ON public.profiles;
CREATE POLICY "profiles_update_own_no_role_escalation"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (
      SELECT p.role
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );

-- 3.2 public.friend_requests
DROP POLICY IF EXISTS "friend_requests_select_participants" ON public.friend_requests;
CREATE POLICY "friend_requests_select_participants"
  ON public.friend_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

DROP POLICY IF EXISTS "friend_requests_insert_sender" ON public.friend_requests;
CREATE POLICY "friend_requests_insert_sender"
  ON public.friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> receiver_id
    AND NOT public.is_blocked_either_way(sender_id, receiver_id)
    AND NOT public.are_friends(sender_id, receiver_id)
  );

DROP POLICY IF EXISTS "friend_requests_update_receiver" ON public.friend_requests;
CREATE POLICY "friend_requests_update_receiver"
  ON public.friend_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "friend_requests_delete_participants" ON public.friend_requests;
CREATE POLICY "friend_requests_delete_participants"
  ON public.friend_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

-- 3.3 public.friendships
DROP POLICY IF EXISTS "friendships_select_participants" ON public.friendships;
CREATE POLICY "friendships_select_participants"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (user_a, user_b));

DROP POLICY IF EXISTS "friendships_insert_from_pending_request" ON public.friendships;
CREATE POLICY "friendships_insert_from_pending_request"
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (user_a, user_b)
    AND NOT public.is_blocked_either_way(user_a, user_b)
    AND EXISTS (
      SELECT 1
      FROM public.friend_requests fr
      WHERE fr.status = 'pending'
        AND fr.receiver_id = auth.uid()
        AND (
          (fr.sender_id = user_a AND fr.receiver_id = user_b)
          OR (fr.sender_id = user_b AND fr.receiver_id = user_a)
        )
    )
  );

DROP POLICY IF EXISTS "friendships_delete_participants" ON public.friendships;
CREATE POLICY "friendships_delete_participants"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (user_a, user_b));

-- 3.4 public.blocked_users
DROP POLICY IF EXISTS "blocked_users_select_own" ON public.blocked_users;
CREATE POLICY "blocked_users_select_own"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocked_users_insert_own" ON public.blocked_users;
CREATE POLICY "blocked_users_insert_own"
  ON public.blocked_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocked_users_delete_own" ON public.blocked_users;
CREATE POLICY "blocked_users_delete_own"
  ON public.blocked_users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- 3.5 public.conversations
DROP POLICY IF EXISTS "conversations_select_member_or_creator" ON public.conversations;
CREATE POLICY "conversations_select_member_or_creator"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member(id, auth.uid())
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "conversations_insert_creator" ON public.conversations;
CREATE POLICY "conversations_insert_creator"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "conversations_update_admin" ON public.conversations;
CREATE POLICY "conversations_update_admin"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (public.is_conversation_admin(id, auth.uid()))
  WITH CHECK (public.is_conversation_admin(id, auth.uid()));

-- 3.6 public.conversation_members
DROP POLICY IF EXISTS "conversation_members_select_member" ON public.conversation_members;
CREATE POLICY "conversation_members_select_member"
  ON public.conversation_members
  FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "conversation_members_insert_admin_or_creator" ON public.conversation_members;
CREATE POLICY "conversation_members_insert_admin_or_creator"
  ON public.conversation_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_conversation_admin(conversation_id, auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "conversation_members_update_self_or_admin" ON public.conversation_members;
CREATE POLICY "conversation_members_update_self_or_admin"
  ON public.conversation_members
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_conversation_admin(conversation_id, auth.uid())
  )
  WITH CHECK (
    public.is_conversation_admin(conversation_id, auth.uid())
    OR (
      auth.uid() = user_id
      AND member_role = (
        SELECT cm.member_role
        FROM public.conversation_members cm
        WHERE cm.conversation_id = conversation_members.conversation_id
          AND cm.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "conversation_members_delete_self_or_admin" ON public.conversation_members;
CREATE POLICY "conversation_members_delete_self_or_admin"
  ON public.conversation_members
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_conversation_admin(conversation_id, auth.uid())
  );

-- 3.7 public.messages (STRICT ADMIN ZERO-ACCESS: NO admin override)
DROP POLICY IF EXISTS "messages_select_member_no_block" ON public.messages;
CREATE POLICY "messages_select_member_no_block"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member(conversation_id, auth.uid())
    AND NOT public.is_blocked_in_direct_conversation(conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "messages_insert_member_no_block" ON public.messages;
CREATE POLICY "messages_insert_member_no_block"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_member(conversation_id, auth.uid())
    AND NOT public.is_blocked_in_direct_conversation(conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "messages_update_sender_soft_delete" ON public.messages;
CREATE POLICY "messages_update_sender_soft_delete"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid()
    AND public.is_conversation_member(conversation_id, auth.uid())
  )
  WITH CHECK (
    sender_id = auth.uid()
    AND is_deleted = true
  );

-- 3.8 public.location_shares
DROP POLICY IF EXISTS "location_shares_select_participants" ON public.location_shares;
CREATE POLICY "location_shares_select_participants"
  ON public.location_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sharer_id, viewer_id));

DROP POLICY IF EXISTS "location_shares_insert_sharer_friend" ON public.location_shares;
CREATE POLICY "location_shares_insert_sharer_friend"
  ON public.location_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sharer_id
    AND sharer_id <> viewer_id
    AND public.are_friends(sharer_id, viewer_id)
    AND NOT public.is_blocked_either_way(sharer_id, viewer_id)
  );

DROP POLICY IF EXISTS "location_shares_update_sharer" ON public.location_shares;
CREATE POLICY "location_shares_update_sharer"
  ON public.location_shares
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sharer_id)
  WITH CHECK (
    auth.uid() = sharer_id
    AND (
      NOT is_active
      OR (
        public.are_friends(sharer_id, viewer_id)
        AND NOT public.is_blocked_either_way(sharer_id, viewer_id)
      )
    )
  );

DROP POLICY IF EXISTS "location_shares_delete_sharer" ON public.location_shares;
CREATE POLICY "location_shares_delete_sharer"
  ON public.location_shares
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sharer_id);

-- 3.9 public.live_locations (STRICT 4-CONDITION GATE & ADMIN ZERO-ACCESS)
DROP POLICY IF EXISTS "live_locations_select_four_condition_gate" ON public.live_locations;
CREATE POLICY "live_locations_select_four_condition_gate"
  ON public.live_locations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      is_paused = false
      AND public.are_friends(auth.uid(), user_id)
      AND NOT public.is_blocked_either_way(auth.uid(), user_id)
      AND EXISTS (
        SELECT 1
        FROM public.location_shares ls
        WHERE ls.sharer_id = live_locations.user_id
          AND ls.viewer_id = auth.uid()
          AND ls.is_active = true
          AND (ls.expires_at IS NULL OR ls.expires_at > now())
      )
    )
  );

DROP POLICY IF EXISTS "live_locations_insert_own" ON public.live_locations;
CREATE POLICY "live_locations_insert_own"
  ON public.live_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "live_locations_update_own" ON public.live_locations;
CREATE POLICY "live_locations_update_own"
  ON public.live_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "live_locations_delete_own" ON public.live_locations;
CREATE POLICY "live_locations_delete_own"
  ON public.live_locations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3.10 public.device_tokens
DROP POLICY IF EXISTS "device_tokens_all_own" ON public.device_tokens;
CREATE POLICY "device_tokens_all_own"
  ON public.device_tokens
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.11 public.reports
DROP POLICY IF EXISTS "reports_insert_reporter" ON public.reports;
CREATE POLICY "reports_insert_reporter"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reporter_id
    AND reporter_id <> reported_user_id
  );

DROP POLICY IF EXISTS "reports_select_reporter_or_admin" ON public.reports;
CREATE POLICY "reports_select_reporter_or_admin"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3.12 public.audit_logs (Immutable Append-Only: NO UPDATE or DELETE policies)
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "audit_logs_insert_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_admin"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid())
    AND actor_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- 4. Private Storage Buckets & Object RLS (storage.buckets & storage.objects)
-- -----------------------------------------------------------------------------

-- 4.1 Provision private buckets with strict MIME and size caps
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    false,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'chat-attachments',
    'chat-attachments',
    false,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4.2 Storage policies for 'avatars' (<user_id>/<filename>)
DROP POLICY IF EXISTS "avatars_select_authenticated" ON storage.objects;
CREATE POLICY "avatars_select_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own_folder" ON storage.objects;
CREATE POLICY "avatars_insert_own_folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update_own_folder" ON storage.objects;
CREATE POLICY "avatars_update_own_folder"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete_own_folder" ON storage.objects;
CREATE POLICY "avatars_delete_own_folder"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4.3 Storage policies for 'chat-attachments' (<conversation_id>/<sender_id>/<filename>)
DROP POLICY IF EXISTS "chat_attachments_select_member" ON storage.objects;
CREATE POLICY "chat_attachments_select_member"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND public.is_conversation_member(
      CASE
        WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN ((storage.foldername(name))[1])::uuid
        ELSE NULL
      END,
      auth.uid()
    )
    AND NOT public.is_blocked_in_direct_conversation(
      CASE
        WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN ((storage.foldername(name))[1])::uuid
        ELSE NULL
      END,
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_attachments_insert_member_sender" ON storage.objects;
CREATE POLICY "chat_attachments_insert_member_sender"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND public.is_conversation_member(
      CASE
        WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN ((storage.foldername(name))[1])::uuid
        ELSE NULL
      END,
      auth.uid()
    )
    AND NOT public.is_blocked_in_direct_conversation(
      CASE
        WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN ((storage.foldername(name))[1])::uuid
        ELSE NULL
      END,
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_attachments_delete_sender" ON storage.objects;
CREATE POLICY "chat_attachments_delete_sender"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND public.is_conversation_member(
      CASE
        WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN ((storage.foldername(name))[1])::uuid
        ELSE NULL
      END,
      auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 5. Supabase Realtime Publication (Idempotent Guard)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  target_table TEXT;
  realtime_tables TEXT[] := ARRAY[
    'messages',
    'live_locations',
    'location_shares',
    'friend_requests',
    'friendships',
    'conversations'
  ];
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH target_table IN ARRAY realtime_tables LOOP
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = target_table
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', target_table);
      END IF;
    END LOOP;
  END IF;
END;
$$;
