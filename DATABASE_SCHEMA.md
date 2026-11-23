# Database Schema Specification — Friends Connect

**Database Engine:** PostgreSQL 15+ (Supabase)  
**Extensions Required:** `uuid-ossp`, `pgcrypto`, `postgis`, `pg_cron`

## Table Definitions

1. **`profiles`:** `id (UUID PK -> auth.users)`, `username (TEXT UNIQUE)`, `display_name (TEXT)`, `avatar_path (TEXT)`, `bio (TEXT)`, `role ('user'|'admin')`, `privacy_last_seen ('everyone'|'friends'|'nobody')`, `last_seen_at`, `created_at`, `updated_at`.
2. **`friend_requests`:** `id (UUID PK)`, `sender_id (FK)`, `receiver_id (FK)`, `status ('pending'|'rejected')`, `created_at`. Constraint: `UNIQUE(sender_id, receiver_id)`, `sender_id <> receiver_id`.
3. **`friendships`:** `id (UUID PK)`, `user_a (FK)`, `user_b (FK)`, `created_at`. Constraint: `CHECK (user_a < user_b)`, `UNIQUE(user_a, user_b)`.
4. **`blocked_users`:** `blocker_id (FK)`, `blocked_id (FK)`, `created_at`. Constraint: `PRIMARY KEY (blocker_id, blocked_id)`.
5. **`conversations`:** `id (UUID PK)`, `type ('direct'|'group')`, `title (TEXT)`, `avatar_path (TEXT)`, `created_by (FK)`, `updated_at`, `created_at`.
6. **`conversation_members`:** `conversation_id (FK)`, `user_id (FK)`, `member_role ('owner'|'admin'|'member')`, `last_read_at`, `is_muted`, `joined_at`. Constraint: `PRIMARY KEY (conversation_id, user_id)`.
7. **`messages`:** `id (UUID PK)`, `conversation_id (FK)`, `sender_id (FK)`, `message_type ('text'|'image'|'system')`, `content (TEXT)`, `attachment_path (TEXT)`, `is_deleted (BOOLEAN)`, `created_at`. Index: `(conversation_id, created_at DESC)`.
8. **`location_shares`:** `id (UUID PK)`, `sharer_id (FK)`, `viewer_id (FK)`, `precision ('exact'|'approximate')`, `is_active (BOOLEAN)`, `expires_at (TIMESTAMPTZ)`, `created_at`. Constraint: `UNIQUE(sharer_id, viewer_id)`.
9. **`live_locations`:** `user_id (UUID PK -> profiles)`, `coords (GEOGRAPHY(Point, 4326))`, `accuracy_meters (REAL)`, `battery_level (SMALLINT)`, `is_paused (BOOLEAN)`, `updated_at`. Index: `GIST(coords)`.
10. **`device_tokens`:** `id (UUID PK)`, `user_id (FK)`, `token (TEXT UNIQUE)`, `platform ('web'|'android'|'ios')`, `updated_at`.
11. **`reports` & `audit_logs`:** Moderation queue and immutable admin audit trail.

## Automated Triggers & Retention

- **`on_auth_user_created`:** Auto-creates a `profiles` record on sign-up.
- **`on_user_blocked`:** Atomically deletes friendships, cancels pending requests, and disables `location_shares` between both users.
- **`pg_cron` (Every 15 min):** Deactivates expired `location_shares` (`expires_at <= now()`) and deletes rows from `live_locations` inactive for > 24 hours.