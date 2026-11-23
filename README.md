# Friends Connect — Private Communication & Live Location Platform

A privacy-first, multi-platform social communication application combining real-time 1-to-1 messaging, group chats, and explicit, revocable live location sharing.

## Core Principles

1. **Zero-Trust Security:** All data access is enforced at the PostgreSQL database level using Row Level Security (RLS). Frontend checks are strictly UX conveniences.
2. **Consent-Based Location Sharing:** Location sharing is opt-in, time-bound, revocable in one tap, and transparent to the sharer at all times. No hidden or historical location tracking is permitted.
3. **Unified Backend Architecture:** A single Supabase backend serves the Responsive Web MVP (React + TypeScript) and native cross-platform mobile clients (Flutter for Android & iOS).

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Web Client (MVP)** | React 19, TypeScript, Vite, Tailwind CSS | Responsive web dashboard, chat, and foreground map |
| **Mobile Client** | Flutter & Dart (Planned Phase 8) | Native Android & iOS background location & push notifications |
| **Backend & Database** | Supabase (PostgreSQL + PostGIS) | Relational data, spatial queries, and automated triggers |
| **Authentication** | Supabase Auth (JWT) | Email/password auth, session management, account lifecycle |
| **Realtime Engine** | Supabase Realtime (WebSockets) | Live messaging, typing indicators, presence, and coordinates |
| **File Storage** | Supabase Storage (Private Buckets) | Avatars and chat media accessed strictly via short-lived Signed URLs |
| **Maps** | Google Maps SDK | Interactive friend map and precision radius overlays |
| **Push Notifications** | Firebase Cloud Messaging (FCM) + APNs | Background message and friend request alerts |

## Documentation Index

- [System Architecture](ARCHITECTURE.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Security & Privacy Model](SECURITY.md)
- [Development Roadmap](DEVELOPMENT_ROADMAP.md)