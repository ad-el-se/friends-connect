import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings2,
  Users,
  WifiOff,
} from 'lucide-react';
import { GroupDrawer } from '@/features/groups/GroupDrawer';
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  SpatialAvatar,
} from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';
import type { ChatMessage, Conversation, FriendRecord } from '@/shared/types/domain';

export function ChatsHub() {
  const { t, locale, isRtl } = useI18n();
  const {
    currentUser,
    friends,
    conversations,
    messagesByConversation,
    selectedConversationId,
    setSelectedConversationId,
    markConversationRead,
    offlineQueueMode,
    setOfflineQueueMode,
    sendMessage,
    focusFriendOnMap,
    isSharingGlobal,
    globalPrecision,
  } = useMockApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all');
  const [draft, setDraft] = useState('');
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [groupDrawerMode, setGroupDrawerMode] = useState<'create' | 'manage' | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((conv) => {
      if (filterType !== 'all' && conv.type !== filterType) return false;
      if (!q) return true;
      const title = (locale === 'ar' ? (conv.titleAr ?? conv.title) : conv.title).toLowerCase();
      const msgs = messagesByConversation[conv.id] ?? [];
      const matchesMsg = msgs.some((m) =>
        (locale === 'ar' ? (m.contentAr ?? m.content) : m.content).toLowerCase().includes(q),
      );
      return title.includes(q) || matchesMsg;
    });
  }, [conversations, filterType, searchQuery, locale, messagesByConversation]);

  const getDirectFriend = (conv: Conversation): FriendRecord | null => {
    if (conv.type !== 'direct') return null;
    const otherId = conv.participantIds.find((id) => id !== currentUser.id);
    return friends.find((f) => f.id === otherId) ?? null;
  };

  const getConvTitle = (conv: Conversation) =>
    locale === 'ar' ? (conv.titleAr ?? conv.title) : conv.title;

  const getSenderName = (senderId: string) => {
    if (senderId === currentUser.id) return t('common.you');
    const friend = friends.find((f) => f.id === senderId);
    if (!friend) return senderId;
    return locale === 'ar' ? friend.displayNameAr : friend.displayName;
  };

  const activeMessages: ChatMessage[] = activeConversation
    ? messagesByConversation[activeConversation.id] ?? []
    : [];

  const activeDirectFriend = activeConversation ? getDirectFriend(activeConversation) : null;
  const friendSharesLocation =
    activeDirectFriend !== null &&
    activeDirectFriend.location.state !== 'not_shared' &&
    activeDirectFriend.location.state !== 'paused';

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    markConversationRead(convId);
    setMobileShowThread(true);
    setAttachmentError(null);
  };

  const handleSendText = (event: FormEvent) => {
    event.preventDefault();
    if (!activeConversation || !draft.trim()) return;
    sendMessage(activeConversation.id, {
      type: 'text',
      content: draft.trim(),
      contentAr: draft.trim(),
    });
    setDraft('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !activeConversation) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAttachmentError(t('chats.invalidMime'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError(t('chats.fileTooLarge'));
      return;
    }

    setAttachmentError(null);
    sendMessage(activeConversation.id, {
      type: 'image',
      content: `Attached ${file.name}`,
      contentAr: `تم إرفاق ${file.name}`,
      attachmentName: file.name,
      attachmentSizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
  };

  const handleSimulateAttachment = (oversized: boolean) => {
    if (!activeConversation) return;
    if (oversized) {
      setAttachmentError(t('chats.fileTooLarge'));
      return;
    }
    setAttachmentError(null);
    sendMessage(activeConversation.id, {
      type: 'image',
      content: 'field-snapshot.webp',
      contentAr: 'صورة ميدانية مرفقة',
      attachmentName: 'field-snapshot.webp',
      attachmentSizeKb: 680,
    });
  };

  const handleShareLocationCard = () => {
    if (!activeConversation) return;
    setAttachmentError(null);
    const isExact = isSharingGlobal && globalPrecision === 'exact';
    sendMessage(activeConversation.id, {
      type: 'location',
      content: 'Shared a live location card',
      contentAr: 'شارك بطاقة موقع حيّ',
      locationSnapshot: {
        label: isExact ? 'Abdoun · Exact GPS' : 'Amman · 500m Zone',
        labelAr: isExact ? 'عبدون · GPS دقيق' : 'عمّان · نطاق 500 م',
        precision: globalPrecision,
        coords: isExact ? '31.9539° N, 35.9106° E' : '31.95° N, 35.91° E (±500m)',
      },
    });
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="flex h-[calc(100vh-112px)] lg:h-screen w-full overflow-hidden bg-[#F6F5F0] dark:bg-[#090B0D]">
      {/* Left/Start List Pane */}
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col border-e border-[#E2DFD5] bg-[#FFFFFF] dark:border-white/[0.08] dark:bg-[#111418] md:w-[360px]',
          mobileShowThread ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="space-y-3 border-b border-[#E2DFD5] p-4 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
              {t('chats.title')}
            </h1>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setGroupDrawerMode('create')}
            >
              {t('chats.newGroup')}
            </Button>
          </div>

          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute start-3 h-4 w-4 text-[#575D66] dark:text-[#8B949E]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chats.searchPlaceholder')}
              className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/60 ps-9 pe-3 py-2 text-xs text-[#111315] outline-none focus:border-[#0066FF] dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-[#E2DFD5] bg-[#EFECE4] p-1 dark:border-white/[0.08] dark:bg-[#191E24]">
            {(['all', 'direct', 'group'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={cn(
                  'flex-1 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors',
                  filterType === tab
                    ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1]'
                    : 'border border-transparent text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]',
                )}
              >
                {tab === 'all'
                  ? t('chats.filterAll')
                  : tab === 'direct'
                    ? t('chats.filterDirect')
                    : t('chats.filterGroups')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 divide-y divide-[#E2DFD5] overflow-y-auto dark:divide-white/[0.08]">
          {filteredConversations.map((conv) => {
            const directFriend = getDirectFriend(conv);
            const list = messagesByConversation[conv.id] ?? [];
            const lastMsg = list[list.length - 1];
            const isSelected = conv.id === activeConversation?.id;

            const previewText = lastMsg
              ? locale === 'ar'
                ? (lastMsg.contentAr ?? lastMsg.content)
                : lastMsg.content
              : '';

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  'flex w-full items-center gap-3 p-4 text-start transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[#0066FF]/[0.06] dark:bg-[#3B82F6]/10'
                    : 'hover:bg-[#EFECE4]/60 dark:hover:bg-[#191E24]/70',
                )}
              >
                {conv.type === 'group' ? (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E2DFD5] bg-[#EFECE4] text-[#111315] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7]">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </div>
                ) : (
                  <SpatialAvatar
                    name={getConvTitle(conv)}
                    src={directFriend?.avatarUrl}
                    size="md"
                    status={
                      directFriend?.location.state === 'live'
                        ? 'live'
                        : directFriend?.location.state === 'approximate'
                          ? 'approximate'
                          : directFriend?.location.state === 'stale'
                            ? 'stale'
                            : 'none'
                    }
                  />
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                        {getConvTitle(conv)}
                      </span>
                      {conv.isMuted && (
                        <BellOff
                          className="h-3.5 w-3.5 shrink-0 text-[#575D66] dark:text-[#8B949E]"
                          aria-label={t('chats.mutedBadge')}
                        />
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E] tabular-nums shrink-0">
                      {conv.updatedAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'truncate text-xs',
                        conv.isTyping
                          ? 'font-medium text-[#059669] dark:text-[#10B981]'
                          : 'text-[#575D66] dark:text-[#8B949E]',
                      )}
                    >
                      {conv.isTyping ? t('common.typing') : previewText}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0066FF] px-1.5 font-mono text-[11px] font-semibold text-white tabular-nums dark:bg-[#3B82F6]">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right/End Active Chat Room */}
      <section
        className={cn(
          'flex min-w-0 flex-1 flex-col bg-[#F6F5F0] dark:bg-[#090B0D]',
          !mobileShowThread ? 'hidden md:flex' : 'flex',
        )}
      >
        {!activeConversation ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              title={t('chats.emptyTitle')}
              description={t('chats.emptyDesc')}
              icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
              className="max-w-md w-full"
            />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DFD5] bg-[#FFFFFF] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111418] sm:px-6">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  aria-label={t('chats.back')}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2DFD5] text-[#111315] md:hidden dark:border-white/[0.1] dark:text-[#F3F5F7] cursor-pointer"
                >
                  <BackIcon className="h-4 w-4" aria-hidden="true" />
                </button>

                {activeConversation.type === 'group' ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2DFD5] bg-[#EFECE4] text-[#111315] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7]">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </div>
                ) : (
                  <SpatialAvatar
                    name={getConvTitle(activeConversation)}
                    src={activeDirectFriend?.avatarUrl}
                    size="sm"
                    status={activeDirectFriend?.isOnlineChat ? 'live' : 'offline'}
                  />
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    {getConvTitle(activeConversation)}
                  </h2>
                  <p className="truncate text-xs text-[#575D66] dark:text-[#8B949E]">
                    {activeConversation.type === 'group'
                      ? t('chats.membersCount', {
                          count: activeConversation.members?.length ?? 0,
                        })
                      : activeConversation.isTyping
                        ? t('common.typing')
                        : activeDirectFriend?.isOnlineChat
                          ? t('common.online')
                          : t('common.offline')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {friendSharesLocation && activeDirectFriend && (
                  <Button
                    variant="hud"
                    size="sm"
                    leftIcon={
                      <MapPin
                        className="h-3.5 w-3.5 text-[#059669] dark:text-[#10B981]"
                        aria-hidden="true"
                      />
                    }
                    onClick={() => focusFriendOnMap(activeDirectFriend.id)}
                  >
                    {t('chats.viewLocation')}
                  </Button>
                )}

                {activeConversation.type === 'group' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Settings2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    onClick={() => setGroupDrawerMode('manage')}
                  >
                    {t('chats.groupDetails')}
                  </Button>
                )}

                {/* Offline Queue Simulation Toggle */}
                <button
                  type="button"
                  onClick={() => setOfflineQueueMode(!offlineQueueMode)}
                  aria-pressed={offlineQueueMode}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors',
                    offlineQueueMode
                      ? 'border-[#D97706]/40 bg-[#D97706]/10 text-[#B45309] dark:border-[#F59E0B]/40 dark:bg-[#F59E0B]/15 dark:text-[#FBBF24]'
                      : 'border-[#E2DFD5] bg-[#EFECE4]/60 text-[#575D66] hover:text-[#111315] dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]',
                  )}
                >
                  <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t('chats.offlineToggle')}</span>
                </button>
              </div>
            </header>

            {offlineQueueMode && (
              <div className="border-b border-[#D97706]/25 bg-[#D97706]/10 px-4 py-2 text-xs font-medium text-[#92400E] dark:border-[#F59E0B]/25 dark:bg-[#F59E0B]/12 dark:text-[#FCD34D] sm:px-6">
                {t('chats.offlineBanner')}
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {activeMessages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <Badge variant="neutral">
                        {locale === 'ar' ? (msg.contentAr ?? msg.content) : msg.content}
                      </Badge>
                    </div>
                  );
                }

                const isOwn = msg.senderId === currentUser.id;
                const text = locale === 'ar' ? (msg.contentAr ?? msg.content) : msg.content;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col gap-1',
                      isOwn ? 'items-end' : 'items-start',
                    )}
                  >
                    {!isOwn && activeConversation.type === 'group' && (
                      <span className="px-1 text-[11px] font-medium text-[#575D66] dark:text-[#8B949E]">
                        {getSenderName(msg.senderId)}
                      </span>
                    )}

                    <div
                      className={cn(
                        'max-w-md rounded-2xl border px-4 py-2.5 text-sm leading-relaxed',
                        isOwn
                          ? 'border-[#0066FF] bg-[#0066FF] text-white dark:border-[#3B82F6] dark:bg-[#3B82F6]'
                          : 'border-[#E2DFD5] bg-[#FFFFFF] text-[#111315] dark:border-white/[0.08] dark:bg-[#111418] dark:text-[#F3F5F7]',
                      )}
                    >
                      {msg.type === 'image' && (
                        <div
                          className={cn(
                            'mb-2 flex items-center gap-2.5 rounded-xl border p-2.5 text-xs',
                            isOwn
                              ? 'border-white/25 bg-white/10 text-white'
                              : 'border-[#E2DFD5] bg-[#EFECE4]/60 text-[#111315] dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#F3F5F7]',
                          )}
                        >
                          <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono font-medium">
                              {msg.attachmentName ?? 'image.webp'}
                            </p>
                            <p className="font-mono text-[10px] opacity-80">
                              {msg.attachmentSizeKb ?? 320} KB · Signed URL (60m)
                            </p>
                          </div>
                        </div>
                      )}

                      {msg.type === 'location' && msg.locationSnapshot && (
                        <div
                          className={cn(
                            'fc-topo-grid mb-2 space-y-1 rounded-xl border p-3 text-xs',
                            isOwn
                              ? 'border-white/25 bg-white/10 text-white'
                              : 'border-[#E2DFD5] bg-[#F6F5F0] text-[#111315] dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#F3F5F7]',
                          )}
                        >
                          <div className="flex items-center gap-1.5 font-semibold">
                            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {locale === 'ar'
                                ? msg.locationSnapshot.labelAr
                                : msg.locationSnapshot.label}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] opacity-85 tabular-nums">
                            {msg.locationSnapshot.coords}
                          </p>
                        </div>
                      )}

                      <p>{text}</p>
                    </div>

                    <div className="flex items-center gap-1.5 px-1 font-mono text-[10px] text-[#575D66] dark:text-[#8B949E] tabular-nums">
                      <span>{msg.createdAt}</span>
                      {isOwn && (
                        <>
                          {msg.status === 'queued' && (
                            <span className="inline-flex items-center gap-1 text-[#D97706] dark:text-[#F59E0B]">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <span>{t('chats.queuedStatus')}</span>
                            </span>
                          )}
                          {msg.status === 'sent' && (
                            <Check className="h-3 w-3" aria-label={t('chats.sentStatus')} />
                          )}
                          {msg.status === 'read' && (
                            <CheckCheck
                              className="h-3.5 w-3.5 text-[#0066FF] dark:text-[#3B82F6]"
                              aria-label={t('chats.readStatus')}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <footer className="border-t border-[#E2DFD5] bg-[#FFFFFF] p-3.5 dark:border-white/[0.08] dark:bg-[#111418] sm:px-6">
              {attachmentError && (
                <div className="mb-3">
                  <ErrorBanner
                    title="Attachment Policy (5 MB Max)"
                    message={attachmentError}
                    onRetry={() => setAttachmentError(null)}
                    retryLabel={t('common.close')}
                  />
                </div>
              )}

              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('chats.attachImage')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSimulateAttachment(false)}
                >
                  Demo 680KB
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSimulateAttachment(true)}
                  className="text-[#DC2626] dark:text-[#EF4444]"
                >
                  Test &gt;5MB Limit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={handleShareLocationCard}
                >
                  {t('chats.shareLocation')}
                </Button>
              </div>

              <form onSubmit={handleSendText} className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('chats.inputPlaceholder')}
                  className="min-w-0 flex-1 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/55 px-4 py-2.5 text-sm text-[#111315] outline-none focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!draft.trim()}
                  rightIcon={<Send className="h-4 w-4" aria-hidden="true" />}
                >
                  {t('chats.send')}
                </Button>
              </form>
            </footer>
          </>
        )}
      </section>

      <GroupDrawer
        isOpen={groupDrawerMode !== null}
        onClose={() => setGroupDrawerMode(null)}
        mode={groupDrawerMode ?? 'create'}
        conversation={activeConversation}
      />
    </div>
  );
}
