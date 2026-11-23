# Security & Privacy Specification — Friends Connect

## 1. Zero-Trust Database Architecture
- Every table in `public` has **Row Level Security (RLS) ENABLED** with a default-deny posture.
- `SUPABASE_SERVICE_ROLE_KEY` is strictly prohibited in client code.

## 2. Row Level Security (RLS) Rules

### `live_locations` (Strict 4-Condition Gate)
`SELECT` on `live_locations.user_id = target_id` is allowed ONLY IF `auth.uid() = target_id` OR ALL FOUR hold:
1. Active share in `location_shares` (`is_active = true` AND `(expires_at IS NULL OR expires_at > now())`).
2. Confirmed friendship in `friendships`.
3. No mutual block in `blocked_users`.
4. `is_paused = false`.
- **Admin Restriction:** System admins receive `0` rows when querying other users' `live_locations` or `messages`.

### `messages` & `conversations`
- `SELECT` / `INSERT` allowed strictly for verified rows in `conversation_members` with no mutual block in direct chats.
- `UPDATE` restricted to `sender_id = auth.uid()` solely to set `is_deleted = true`.

## 3. Storage & Rate Limiting
- Private buckets (`avatars`, `chat-attachments`) accessed strictly via 60-minute Signed URLs after verifying conversation membership.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp` (Max 5MB chat, 2MB avatar).
- Database trigger throttles `live_locations` writes to at most 1 update per 10 seconds per user.