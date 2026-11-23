import { useMemo, useState } from 'react';
import {
  Clock,
  Crosshair,
  LocateFixed,
  MessageSquare,
  Minus,
  Navigation,
  PauseCircle,
  Plus,
  Radar,
  Users,
} from 'lucide-react';
import {
  Badge,
  BottomSheet,
  Button,
  ConfirmDialog,
  EmptyState,
  PrivacyHudPill,
  SpatialAvatar,
} from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';
import type { FriendRecord } from '@/shared/types/domain';
import type { SpatialAvatarStatus } from '@/shared/types/ui';

function mapLocationStateToAvatarStatus(
  state: FriendRecord['location']['state'],
): SpatialAvatarStatus {
  if (state === 'live') return 'live';
  if (state === 'approximate') return 'approximate';
  if (state === 'stale') return 'stale';
  return 'offline';
}

export function LiveMapHub() {
  const { t, locale } = useI18n();
  const {
    friends,
    currentUser,
    isSharingGlobal,
    ghostMode,
    globalPrecision,
    remainingSeconds,
    activeBroadcastViewersCount,
    selectedFriendIdOnMap,
    setSelectedFriendIdOnMap,
    toggleGlobalSharing,
    openDirectChat,
  } = useMockApp();

  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState<'all' | 'live'>('all');
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const visibleOnMap = useMemo(
    () =>
      friends.filter((f) => {
        if (f.location.state === 'not_shared') return false;
        if (filter === 'live') {
          return f.location.state === 'live' || f.location.state === 'approximate';
        }
        return true;
      }),
    [friends, filter],
  );

  const selectedFriend = useMemo(
    () => friends.find((f) => f.id === selectedFriendIdOnMap) ?? null,
    [friends, selectedFriendIdOnMap],
  );

  // Compute subtle pan offset to center selected friend cleanly
  const panOffset = useMemo(() => {
    if (!selectedFriend || selectedFriend.location.state === 'not_shared') {
      return { x: 0, y: 0 };
    }
    return {
      x: (50 - selectedFriend.location.mapX) * 0.45,
      y: (50 - selectedFriend.location.mapY) * 0.45,
    };
  }, [selectedFriend]);

  const getDisplayName = (f: FriendRecord) =>
    locale === 'ar' ? f.displayNameAr : f.displayName;

  const getAreaLabel = (f: FriendRecord) =>
    locale === 'ar' ? f.location.areaLabelAr : f.location.areaLabel;

  const getStatusLabel = (f: FriendRecord) => {
    switch (f.location.state) {
      case 'live':
        return t('map.statusLiveExact');
      case 'approximate':
        return t('map.statusApprox');
      case 'stale':
        return t('map.statusStale', { m: f.location.updatedMinutesAgo });
      case 'paused':
        return t('map.statusPaused', { m: f.location.updatedMinutesAgo });
      case 'not_shared':
        return t('map.statusNotShared');
    }
  };

  const renderFriendList = (closeOnSelect: boolean) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-[#E2DFD5] bg-[#EFECE4] p-0.5 dark:border-white/[0.08] dark:bg-[#191E24]">
          {(['all', 'live'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors',
                filter === tab
                  ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1]'
                  : 'border border-transparent text-[#575D66] dark:text-[#8B949E]',
              )}
            >
              {tab === 'all' ? t('map.filterAll') : t('map.filterLive')}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E] tabular-nums">
          {t('map.activeCount', {
            count: friends.filter(
              (f) => f.location.state === 'live' || f.location.state === 'approximate',
            ).length,
          })}
        </span>
      </div>

      {visibleOnMap.length === 0 ? (
        <EmptyState
          title={t('map.emptyTitle')}
          description={t('map.emptyDesc')}
        />
      ) : (
        <div className="divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418]">
          {visibleOnMap.map((friend) => {
            const isSelected = friend.id === selectedFriendIdOnMap;
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => {
                  setSelectedFriendIdOnMap(friend.id);
                  if (closeOnSelect) setIsMobileSheetOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 p-3.5 text-start transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl',
                  isSelected
                    ? 'bg-[#0066FF]/[0.06] dark:bg-[#3B82F6]/10'
                    : 'hover:bg-[#EFECE4]/60 dark:hover:bg-[#191E24]/70',
                )}
              >
                <SpatialAvatar
                  name={getDisplayName(friend)}
                  src={friend.avatarUrl}
                  size="md"
                  status={mapLocationStateToAvatarStatus(friend.location.state)}
                  batteryLevel={friend.location.batteryLevel}
                  className={friend.location.state === 'paused' ? 'opacity-55 grayscale' : ''}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                      {getDisplayName(friend)}
                    </span>
                    <span className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E] tabular-nums shrink-0">
                      {friend.location.distanceKm} km
                    </span>
                  </div>
                  <p className="truncate text-xs text-[#575D66] dark:text-[#8B949E]">
                    {getStatusLabel(friend)} · {getAreaLabel(friend)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex h-[calc(100vh-112px)] lg:h-screen w-full overflow-hidden bg-[#F6F5F0] dark:bg-[#090B0D]">
      {/* Topographic Vector / CSS Map Canvas */}
      <div className="relative flex-1 overflow-hidden">
        {/* Top-center Floating PrivacyHudPill */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <div className="pointer-events-auto">
            <PrivacyHudPill
              isSharing={isSharingGlobal}
              ghostMode={ghostMode}
              precision={globalPrecision}
              activeFriendsCount={activeBroadcastViewersCount}
              remainingSeconds={remainingSeconds}
              onStopClick={() => setIsStopDialogOpen(true)}
              onResumeClick={() => toggleGlobalSharing(true)}
            />
          </div>
        </div>

        {/* Zoom & Center Controls */}
        <div className="absolute bottom-20 end-4 z-20 flex flex-col gap-2 lg:bottom-6">
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2DFD5] bg-white/90 backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#111418]/90">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))}
              aria-label={t('map.zoomIn')}
              title={t('map.zoomIn')}
              className="flex h-10 w-10 items-center justify-center border-b border-[#E2DFD5] text-[#111315] hover:bg-[#EFECE4] dark:border-white/[0.08] dark:text-[#F3F5F7] dark:hover:bg-[#191E24] cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
              aria-label={t('map.zoomOut')}
              title={t('map.zoomOut')}
              className="flex h-10 w-10 items-center justify-center text-[#111315] hover:bg-[#EFECE4] dark:text-[#F3F5F7] dark:hover:bg-[#191E24] cursor-pointer"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedFriendIdOnMap(null);
              setZoom(1);
            }}
            aria-label={t('map.centerOnMe')}
            title={t('map.centerOnMe')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2DFD5] bg-white/90 text-[#0066FF] backdrop-blur-xl hover:bg-[#EFECE4] dark:border-white/[0.1] dark:bg-[#111418]/90 dark:text-[#3B82F6] dark:hover:bg-[#191E24] cursor-pointer"
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Mobile Friends Sheet Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            aria-label={t('map.friendsListTitle')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2DFD5] bg-[#0066FF] text-white lg:hidden cursor-pointer dark:border-white/[0.1] dark:bg-[#3B82F6]"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Selected Friend Quick-Action Card (bottom-start on canvas) */}
        {selectedFriend && selectedFriend.location.state !== 'not_shared' && (
          <div className="fc-surface absolute bottom-4 start-4 z-20 w-[calc(100%-5rem)] max-w-sm rounded-2xl p-4 backdrop-blur-xl bg-white/95 dark:bg-[#111418]/95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <SpatialAvatar
                  name={getDisplayName(selectedFriend)}
                  src={selectedFriend.avatarUrl}
                  size="md"
                  status={mapLocationStateToAvatarStatus(selectedFriend.location.state)}
                  batteryLevel={selectedFriend.location.batteryLevel}
                  className={selectedFriend.location.state === 'paused' ? 'opacity-55 grayscale' : ''}
                />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    {getDisplayName(selectedFriend)}
                  </h3>
                  <p className="truncate font-mono text-[11px] text-[#575D66] dark:text-[#8B949E]">
                    @{selectedFriend.username} · {getAreaLabel(selectedFriend)}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => openDirectChat(selectedFriend.id)}
              >
                {t('map.messageAction')}
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E2DFD5] pt-3 text-xs dark:border-white/[0.08]">
              <div>
                <p className="text-[11px] text-[#575D66] dark:text-[#8B949E]">
                  {t('map.precisionLabel')}
                </p>
                <p className="mt-0.5 font-mono font-medium text-[#111315] dark:text-[#F3F5F7]">
                  {selectedFriend.location.precision === 'exact' ? 'Exact' : '500m'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#575D66] dark:text-[#8B949E]">
                  {t('map.distanceLabel')}
                </p>
                <p className="mt-0.5 font-mono font-medium text-[#111315] dark:text-[#F3F5F7] tabular-nums">
                  {selectedFriend.location.distanceKm} km
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#575D66] dark:text-[#8B949E]">
                  {t('map.updatedLabel')}
                </p>
                <p className="mt-0.5 font-mono font-medium text-[#111315] dark:text-[#F3F5F7] tabular-nums">
                  {selectedFriend.location.updatedMinutesAgo === 0
                    ? t('common.justNow')
                    : t('common.minutesAgo', {
                        count: selectedFriend.location.updatedMinutesAgo,
                      })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Topographic Interactive Viewport */}
        <div
          className="fc-topo-grid relative h-full w-full transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}%, ${panOffset.y}%)`,
          }}
        >
          {/* Cartographic Topographic Contour & Street Vector Layer */}
          <svg
            viewBox="0 0 1000 700"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M -50 180 Q 240 120 480 210 T 1050 160"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-[#E2DFD5] dark:text-white/[0.06]"
            />
            <path
              d="M -40 420 Q 280 350 560 440 T 1040 390"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-[#E2DFD5] dark:text-white/[0.06]"
            />
            <path
              d="M 210 -20 C 260 220, 320 460, 290 730"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[#DFDBD0] dark:text-white/[0.07]"
            />
            <path
              d="M 620 -20 C 590 230, 680 450, 740 730"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[#DFDBD0] dark:text-white/[0.07]"
            />
            <ellipse
              cx="500"
              cy="350"
              rx="230"
              ry="150"
              fill="none"
              stroke="currentColor"
              strokeDasharray="6 6"
              className="text-[#D8D4C8] dark:text-white/[0.05]"
            />
          </svg>

          {/* Current User Marker (Center 50%, 50%) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="relative flex items-center justify-center">
              {isSharingGlobal && !ghostMode && (
                <span
                  className={cn(
                    'absolute rounded-full border transition-all duration-300',
                    globalPrecision === 'exact'
                      ? 'h-12 w-12 border-[#059669]/40 bg-[#059669]/10 dark:border-[#10B981]/40'
                      : 'h-24 w-24 border-dashed border-[#0066FF]/45 bg-[#0066FF]/10 dark:border-[#3B82F6]/45',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-sm dark:border-[#090B0D]',
                  isSharingGlobal && !ghostMode
                    ? 'bg-[#0066FF] dark:bg-[#3B82F6]'
                    : 'bg-[#DC2626] dark:bg-[#EF4444]',
                )}
              >
                <Navigation className="h-2.5 w-2.5 text-white" aria-hidden="true" />
              </span>
            </div>
            <Badge variant="neutral" mono className="text-[10px]">
              {t('common.you')} (@{currentUser.username})
            </Badge>
          </div>

          {/* Friend Pins */}
          {visibleOnMap.map((friend) => {
            const isSelected = friend.id === selectedFriendIdOnMap;
            const state = friend.location.state;

            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => setSelectedFriendIdOnMap(friend.id)}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none',
                  isSelected ? 'z-20 scale-105' : 'z-10 hover:z-20 hover:scale-105',
                  'transition-transform duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
                )}
                style={{
                  left: `${friend.location.mapX}%`,
                  top: `${friend.location.mapY}%`,
                }}
              >
                {/* 500m Approximate Radius Circle Zone */}
                {state === 'approximate' && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute h-28 w-28 rounded-full border border-dashed border-[#D97706]/60 bg-[#D97706]/10 dark:border-[#F59E0B]/55 dark:bg-[#F59E0B]/10"
                  />
                )}

                {/* Pulsing ring for Live Exact */}
                {state === 'live' && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute h-16 w-16 rounded-full border border-[#059669]/35 bg-[#059669]/10 animate-pulse dark:border-[#10B981]/35"
                  />
                )}

                <div
                  className={cn(
                    'relative rounded-full p-0.5 transition-all',
                    isSelected && 'ring-2 ring-[#0066FF] dark:ring-[#3B82F6]',
                    state === 'paused' && 'opacity-55 grayscale',
                  )}
                >
                  <SpatialAvatar
                    name={getDisplayName(friend)}
                    src={friend.avatarUrl}
                    size="md"
                    status={mapLocationStateToAvatarStatus(state)}
                    batteryLevel={friend.location.batteryLevel}
                  />
                </div>

                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium backdrop-blur-md whitespace-nowrap',
                    'bg-white/90 border-[#E2DFD5] text-[#111315] dark:bg-[#111418]/90 dark:border-white/[0.1] dark:text-[#F3F5F7]',
                    isSelected && 'border-[#0066FF] dark:border-[#3B82F6]',
                  )}
                >
                  {state === 'live' && (
                    <Crosshair className="h-3 w-3 text-[#059669] dark:text-[#10B981]" aria-hidden="true" />
                  )}
                  {state === 'approximate' && (
                    <Radar className="h-3 w-3 text-[#D97706] dark:text-[#F59E0B]" aria-hidden="true" />
                  )}
                  {state === 'stale' && (
                    <Clock className="h-3 w-3 text-[#D97706] dark:text-[#F59E0B]" aria-hidden="true" />
                  )}
                  {state === 'paused' && (
                    <PauseCircle className="h-3 w-3 text-[#575D66] dark:text-[#8B949E]" aria-hidden="true" />
                  )}
                  <span>{getDisplayName(friend)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Side Drawer */}
      <aside className="hidden lg:flex w-[340px] shrink-0 flex-col border-s border-[#E2DFD5] bg-[#FFFFFF] p-5 overflow-y-auto dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="mb-4 space-y-1">
          <h2 className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
            {t('map.friendsListTitle')}
          </h2>
          <p className="text-xs leading-relaxed text-[#575D66] dark:text-[#8B949E]">
            {t('map.friendsListSubtitle')}
          </p>
        </div>

        {renderFriendList(false)}
      </aside>

      {/* Mobile BottomSheet Friend List */}
      <BottomSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        title={t('map.friendsListTitle')}
        description={t('map.friendsListSubtitle')}
      >
        {renderFriendList(true)}
      </BottomSheet>

      {/* ConfirmDialog for Privacy Kill-Switch */}
      <ConfirmDialog
        isOpen={isStopDialogOpen}
        onClose={() => setIsStopDialogOpen(false)}
        onConfirm={() => {
          toggleGlobalSharing(false);
          setIsStopDialogOpen(false);
        }}
        title={t('hud.stopTitle')}
        description={t('hud.stopDesc')}
        confirmLabel={t('hud.stopConfirm')}
        cancelLabel={t('hud.keepSharing')}
        variant="danger"
      />
    </div>
  );
}
