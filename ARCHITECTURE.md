# System Architecture — Friends Connect

## 1. High-Level Architecture Overview

Friends Connect follows a **Unified Backend / Multi-Client Architecture**. Business rules, authorization boundaries, and data validation reside inside PostgreSQL and Supabase Edge Functions so that Web, Android, and iOS clients share identical security guarantees.

### Architectural Layers

1. **Client Layer:**
   - **Web Application (React + TypeScript):** Modular feature-sliced SPA. Supports real-time chat, friend management, admin moderation, and foreground live map viewing/sharing.
   - **Mobile Application (Flutter — Android & iOS):** Shares the exact Supabase REST/Realtime contracts while adding OS-level background location services, SQLite offline message queueing, and native FCM/APNs push notifications.
2. **Gateway & Realtime Layer (Supabase):**
   - **PostgREST:** Auto-generated RESTful endpoints authenticated via short-lived JWTs.
   - **Supabase Realtime:** Multiplexed WebSocket channels for `postgres_changes` (messages, location updates) and `Presence` (online/typing status), gated by Realtime RLS authorization.
   - **Edge Functions (Deno):** Executes privileged workflows (FCM/APNs notification dispatch, approximate coordinate fuzzing, and cascading account deletion).
3. **Persistence & Storage Layer:**
   - **PostgreSQL 15+ with PostGIS:** Handles relational integrity and spatial point representations (`GEOGRAPHY(Point, 4326)`).
   - **Supabase Storage:** Private object storage for avatars and chat attachments.

---

## 2. Live Location Engine & Throttling Strategy

| Client State | Distance Threshold | Time Threshold | Purpose |
| :--- | :---: | :---: | :--- |
| **Active Map View (Foreground)** | 15 meters | 15 seconds | Smooth real-time movement when friends are actively watching |
| **Background Sharing (Mobile)** | 50 meters | 60 seconds | Battery-efficient background updates while moving |
| **Stationary / Idle** | 0 meters | 180 seconds | Lightweight heartbeat (`updated_at` refresh) without GPS polling |

### Location Precision Modes
- **`exact`:** Transmits exact GPS coordinates (`lat`, `lng`, `accuracy_meters`).
- **`approximate`:** Applies deterministic spatial jitter (500m radius offset) server-side before exposing coordinates to the viewer.

### Stale & Offline State Machine
- **Fresh (`0 - 3 min`):** Active marker with live status indicator.
- **Stale (`3 - 15 min`):** Grayscale marker displaying `"Last updated X min ago"`.
- **Unavailable (`> 15 min` or `is_paused = true`):** Marker dims/hides from active map view and shows `"Location paused / unavailable"`.

---

## 3. Architecture Decision Records (ADRs)

- **ADR-001 (Single-Row Live State vs. History Log):** `live_locations` maintains exactly one row per user updated via `UPSERT`. Historical movement trails are deliberately omitted.
- **ADR-002 (Channel Isolation):** Chat rooms subscribe to conversation-scoped Realtime channels only while mounted; the map subscribes to authorized friend location updates only while the Map Hub is active.
- **ADR-003 (Automated Block Cascading):** Blocking a user triggers a PostgreSQL `AFTER INSERT` trigger on `blocked_users` that atomically removes friendships, cancels pending friend requests, and disables all `location_shares` between both parties.