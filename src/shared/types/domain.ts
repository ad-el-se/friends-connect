import type { LocationPrecision } from '@/shared/types/ui';

export type AppTab = 'map' | 'chats' | 'friends' | 'settings' | 'admin';

export type UserRole = 'user' | 'admin';
export type LastSeenPrivacy = 'everyone' | 'friends' | 'nobody';
export type ShareExpiration = '15m' | '1h' | '8h' | 'until_stopped';
export type GroupMemberRole = 'owner' | 'admin' | 'member';

export type FriendLocationState =
  | 'live'
  | 'approximate'
  | 'stale'
  | 'paused'
  | 'not_shared';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  displayNameAr: string;
  avatarUrl?: string | null;
  bio: string;
  bioAr: string;
  role: UserRole;
  privacyLastSeen: LastSeenPrivacy;
  lastSeenAt: string;
  isSuspended?: boolean;
}

export interface FriendLocation {
  state: FriendLocationState;
  precision: LocationPrecision;
  lat: number;
  lng: number;
  /** Normalized percentage position (0-100) on the topographic vector canvas */
  mapX: number;
  mapY: number;
  accuracyMeters: number;
  batteryLevel?: number;
  distanceKm: number;
  updatedMinutesAgo: number;
  areaLabel: string;
  areaLabelAr: string;
}

export interface OutboundLocationShare {
  isActive: boolean;
  precision: LocationPrecision;
  expiresIn: ShareExpiration;
}

export interface FriendRecord extends UserProfile {
  location: FriendLocation;
  shareToFriend: OutboundLocationShare;
  isOnlineChat: boolean;
}

export interface FriendRequest {
  id: string;
  direction: 'incoming' | 'outgoing';
  user: UserProfile;
  createdAt: string;
}

export interface BlockedUser {
  user: UserProfile;
  blockedAt: string;
}

export type MessageType = 'text' | 'image' | 'location' | 'system';
export type MessageDeliveryStatus = 'sent' | 'read' | 'queued';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  contentAr?: string;
  attachmentName?: string;
  attachmentSizeKb?: number;
  locationSnapshot?: {
    label: string;
    labelAr: string;
    precision: LocationPrecision;
    coords: string;
  };
  status: MessageDeliveryStatus;
  createdAt: string;
  isDeleted?: boolean;
}

export interface GroupMember {
  userId: string;
  role: GroupMemberRole;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title: string;
  titleAr?: string;
  participantIds: string[];
  members?: GroupMember[];
  isMuted: boolean;
  unreadCount: number;
  updatedAt: string;
  isTyping?: boolean;
}

export interface ModerationReport {
  id: string;
  reporterUsername: string;
  targetUserId: string;
  targetUsername: string;
  reason: string;
  reasonAr: string;
  details: string;
  detailsAr: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUsername: string;
  action: string;
  targetUsername: string;
  timestamp: string;
  metadata: string;
}
