import { useMemo, useState } from 'react';
import {
  Ban,
  Check,
  Flag,
  MapPin,
  MessageSquare,
  Search,
  ShieldAlert,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  SpatialAvatar,
} from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';
import type { FriendRecord, UserProfile } from '@/shared/types/domain';

export function FriendsDirectory() {
  const { t, locale } = useI18n();
  const {
    friends,
    requests,
    blockedUsers,
    openDirectChat,
    setActiveTab,
    removeFriend,
    blockUser,
    unblockUser,
    acceptRequest,
    declineRequest,
    cancelRequest,
    submitReport,
  } = useMockApp();

  const [tab, setTab] = useState<'friends' | 'requests' | 'blocked'>('friends');
  const [query, setQuery] = useState('');
  const [blockTarget, setBlockTarget] = useState<UserProfile | null>(null);
  const [reportTarget, setReportTarget] = useState<FriendRecord | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportBanner, setReportBanner] = useState(false);

  const getName = (u: UserProfile) => (locale === 'ar' ? u.displayNameAr : u.displayName);
  const getBio = (u: UserProfile) => (locale === 'ar' ? u.bioAr : u.bio);

  const matchesQuery = (u: UserProfile) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.displayNameAr.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  };

  const filteredFriends = useMemo(() => friends.filter(matchesQuery), [friends, query]);
  const incomingRequests = useMemo(
    () => requests.filter((r) => r.direction === 'incoming' && matchesQuery(r.user)),
    [requests, query],
  );
  const outgoingRequests = useMemo(
    () => requests.filter((r) => r.direction === 'outgoing' && matchesQuery(r.user)),
    [requests, query],
  );
  const filteredBlocked = useMemo(
    () => blockedUsers.filter((b) => matchesQuery(b.user)),
    [blockedUsers, query],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-1 border-b border-[#E2DFD5] pb-5 dark:border-white/[0.08]">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
          {t('friends.title')}
        </h1>
        <p className="text-sm text-[#575D66] dark:text-[#8B949E]">{t('friends.subtitle')}</p>
      </header>

      {reportBanner && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 px-4 py-3 text-xs font-medium text-[#065F46] dark:border-[#10B981]/30 dark:bg-[#10B981]/10 dark:text-[#6EE7B7]">
          <span>{t('friends.reportSent')}</span>
          <button
            type="button"
            onClick={() => setReportBanner(false)}
            className="cursor-pointer opacity-80 hover:opacity-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search
            className="pointer-events-none absolute start-3.5 h-4 w-4 text-[#575D66] dark:text-[#8B949E]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('friends.searchPlaceholder')}
            className="w-full rounded-xl border border-[#E2DFD5] bg-[#FFFFFF] ps-10 pe-3.5 py-2.5 text-sm text-[#111315] outline-none focus:border-[#0066FF] dark:border-white/[0.08] dark:bg-[#111418] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
          />
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-[#E2DFD5] bg-[#EFECE4] p-1 dark:border-white/[0.08] dark:bg-[#191E24]">
          {(
            [
              { id: 'friends', label: t('friends.tabFriends'), count: friends.length },
              { id: 'requests', label: t('friends.tabRequests'), count: requests.length },
              { id: 'blocked', label: t('friends.tabBlocked'), count: blockedUsers.length },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors',
                tab === item.id
                  ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1]'
                  : 'border border-transparent text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]',
              )}
            >
              <span>{item.label}</span>
              <span className="font-mono text-[11px] opacity-75 tabular-nums">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Friends */}
      {tab === 'friends' && (
        <>
          {filteredFriends.length === 0 ? (
            <EmptyState
              title={t('friends.emptyFriends')}
              description={t('friends.emptyFriendsDesc')}
            />
          ) : (
            <div className="divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418]">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <SpatialAvatar
                      name={getName(friend)}
                      src={friend.avatarUrl}
                      size="md"
                      status={
                        friend.location.state === 'live'
                          ? 'live'
                          : friend.location.state === 'approximate'
                            ? 'approximate'
                            : friend.location.state === 'stale'
                              ? 'stale'
                              : 'offline'
                      }
                      batteryLevel={friend.location.batteryLevel}
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                          {getName(friend)}
                        </span>
                        <Badge variant="neutral" mono>
                          @{friend.username}
                        </Badge>
                        {friend.shareToFriend.isActive && (
                          <Badge
                            variant={
                              friend.shareToFriend.precision === 'exact'
                                ? 'live'
                                : 'approximate'
                            }
                          >
                            {friend.shareToFriend.precision === 'exact'
                              ? 'Exact Share'
                              : '500m Share'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#575D66] dark:text-[#8B949E]">
                        {getBio(friend)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => openDirectChat(friend.id)}
                    >
                      {t('friends.message')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => setActiveTab('settings')}
                    >
                      {t('friends.shareShortcut')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<UserMinus className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => removeFriend(friend.id)}
                    >
                      {t('friends.remove')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Flag className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => {
                        setReportTarget(friend);
                        setReportReason('');
                      }}
                    >
                      {t('friends.report')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Ban className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => setBlockTarget(friend)}
                    >
                      {t('friends.block')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Requests */}
      {tab === 'requests' && (
        <div className="space-y-6">
          {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
            <EmptyState
              title={t('friends.emptyRequests')}
              description={t('friends.emptyRequestsDesc')}
              icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}
            />
          ) : (
            <>
              {incomingRequests.length > 0 && (
                <div className="space-y-2.5">
                  <h2 className="text-xs font-semibold text-[#575D66] dark:text-[#8B949E]">
                    {t('friends.incoming')} ({incomingRequests.length})
                  </h2>
                  <div className="divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418]">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SpatialAvatar
                            name={getName(req.user)}
                            src={req.user.avatarUrl}
                            size="md"
                            status="none"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                                {getName(req.user)}
                              </span>
                              <span className="font-mono text-xs text-[#575D66] dark:text-[#8B949E]">
                                @{req.user.username}
                              </span>
                            </div>
                            <p className="text-xs text-[#575D66] dark:text-[#8B949E]">
                              {getBio(req.user)} · {req.createdAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            onClick={() => acceptRequest(req.id)}
                          >
                            {t('friends.accept')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<X className="h-3.5 w-3.5" aria-hidden="true" />}
                            onClick={() => declineRequest(req.id)}
                          >
                            {t('friends.decline')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div className="space-y-2.5">
                  <h2 className="text-xs font-semibold text-[#575D66] dark:text-[#8B949E]">
                    {t('friends.outgoing')} ({outgoingRequests.length})
                  </h2>
                  <div className="divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418]">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SpatialAvatar
                            name={getName(req.user)}
                            src={req.user.avatarUrl}
                            size="md"
                            status="none"
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                              {getName(req.user)}
                            </span>
                            <p className="font-mono text-xs text-[#575D66] dark:text-[#8B949E]">
                              @{req.user.username} · {req.createdAt}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => cancelRequest(req.id)}
                        >
                          {t('friends.cancelReq')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Blocked Users */}
      {tab === 'blocked' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2DFD5] bg-[#EFECE4]/60 p-4 text-xs leading-relaxed text-[#575D66] dark:border-white/[0.08] dark:bg-[#191E24]/70 dark:text-[#8B949E]">
            <ShieldAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706] dark:text-[#F59E0B]"
              aria-hidden="true"
            />
            <p>{t('friends.blockIsolationNotice')}</p>
          </div>

          {filteredBlocked.length === 0 ? (
            <EmptyState
              title={t('friends.emptyBlocked')}
              description={t('friends.emptyBlockedDesc')}
            />
          ) : (
            <div className="divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418]">
              {filteredBlocked.map((entry) => (
                <div
                  key={entry.user.id}
                  className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SpatialAvatar
                      name={getName(entry.user)}
                      src={entry.user.avatarUrl}
                      size="md"
                      status="offline"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                        {getName(entry.user)}
                      </p>
                      <p className="font-mono text-xs text-[#575D66] dark:text-[#8B949E]">
                        @{entry.user.username} · {entry.blockedAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => unblockUser(entry.user.id)}
                  >
                    {t('friends.unblock')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Block ConfirmDialog */}
      <ConfirmDialog
        isOpen={blockTarget !== null}
        onClose={() => setBlockTarget(null)}
        onConfirm={() => {
          if (blockTarget) {
            blockUser(blockTarget.id);
            setBlockTarget(null);
          }
        }}
        title={t('friends.blockTitle', {
          name: blockTarget ? getName(blockTarget) : '',
        })}
        description={t('friends.blockDesc')}
        confirmLabel={t('friends.blockConfirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />

      {/* Report Modal */}
      <Modal
        isOpen={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        title={t('friends.reportTitle')}
        description={t('friends.reportDesc')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setReportTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!reportReason.trim()}
              onClick={() => {
                if (reportTarget) {
                  submitReport(reportTarget.id, reportReason);
                  setReportTarget(null);
                  setReportBanner(true);
                }
              }}
            >
              {t('friends.reportSubmit')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {reportTarget && (
            <p className="font-mono text-xs text-[#575D66] dark:text-[#8B949E]">
              Target: @{reportTarget.username}
            </p>
          )}
          <div className="space-y-1.5">
            <label
              htmlFor="report-reason"
              className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
            >
              {t('friends.reportReason')}
            </label>
            <textarea
              id="report-reason"
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 p-3 text-sm text-[#111315] outline-none focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
