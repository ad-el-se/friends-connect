export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'hud';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type SpatialAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpatialAvatarStatus = 'live' | 'approximate' | 'stale' | 'offline' | 'none';

export type BadgeVariant =
  | 'live'
  | 'approximate'
  | 'stale'
  | 'paused'
  | 'admin'
  | 'neutral';

export type LocationPrecision = 'exact' | 'approximate';
export type SharingState = 'active' | 'paused';
