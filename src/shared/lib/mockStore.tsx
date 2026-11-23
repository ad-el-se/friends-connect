import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import anasAvatar from '@/assets/images/avatar_anas_portrait_1795445543719.jpg';
import omarAvatar from '@/assets/images/avatar_omar_portrait_1795444581489.jpg';
import sarahAvatar from '@/assets/images/avatar_sarah_portrait_1795444581985.jpg';
import tariqAvatar from '@/assets/images/avatar_tariq_portrait_1795445543252.jpg';
import type {
  AppTab,
  AuditLogEntry,
  BlockedUser,
  ChatMessage,
  Conversation,
  FriendRecord,
  FriendRequest,
  GroupMemberRole,
  LastSeenPrivacy,
  ModerationReport,
  OutboundLocationShare,
  UserProfile,
} from '@/shared/types/domain';
import type { LocationPrecision } from '@/shared/types/ui';

const INITIAL_USER: UserProfile = {
  id: 'u-adel',
  username: 'adel_sec',
  displayName: 'Adel Suleiman',
  displayNameAr: 'عادل سليمان',
  avatarUrl: null,
  bio: 'Privacy systems architect · Building consent-first tools.',
  bioAr: 'مهندس أنظمة خصوصية · بناء أدوات قائمة على الموافقة الصريحة.',
  role: 'admin',
  privacyLastSeen: 'friends',
  lastSeenAt: 'Just now',
};

const INITIAL_FRIENDS: FriendRecord[] = [
  {
    id: 'u-anas',
    username: 'anas_dev',
    displayName: 'Anas Ahmad',
    displayNameAr: 'أنس أحمد',
    avatarUrl: anasAvatar,
    bio: 'Systems & Flutter engineer in Amman.',
    bioAr: 'مهندس أنظمة وتطبيقات في عمّان.',
    role: 'user',
    privacyLastSeen: 'friends',
    lastSeenAt: 'Just now',
    isOnlineChat: true,
    location: {
      state: 'live',
      precision: 'exact',
      lat: 31.9539,
      lng: 35.9106,
      mapX: 34,
      mapY: 36,
      accuracyMeters: 6,
      batteryLevel: 84,
      distanceKm: 0.8,
      updatedMinutesAgo: 0,
      areaLabel: 'Abdoun North',
      areaLabelAr: 'عبدون الشمالي',
    },
    shareToFriend: {
      isActive: true,
      precision: 'exact',
      expiresIn: '1h',
    },
  },
  {
    id: 'u-omar',
    username: 'omar_k',
    displayName: 'Omar Khaled',
    displayNameAr: 'عمر خالد',
    avatarUrl: omarAvatar,
    bio: 'Cartography & product design.',
    bioAr: 'تصميم المنتجات والخرائط الرقمية.',
    role: 'user',
    privacyLastSeen: 'friends',
    lastSeenAt: '1m ago',
    isOnlineChat: true,
    location: {
      state: 'approximate',
      precision: 'approximate',
      lat: 31.9682,
      lng: 35.8812,
      mapX: 67,
      mapY: 32,
      accuracyMeters: 500,
      batteryLevel: 61,
      distanceKm: 2.4,
      updatedMinutesAgo: 1,
      areaLabel: 'Shmeisani District',
      areaLabelAr: 'منطقة الشميساني',
    },
    shareToFriend: {
      isActive: true,
      precision: 'approximate',
      expiresIn: '8h',
    },
  },
  {
    id: 'u-tariq',
    username: 'tariq_m',
    displayName: 'Tariq Mansour',
    displayNameAr: 'طارق منصور',
    avatarUrl: tariqAvatar,
    bio: 'Trail runner & hardware tinkerer.',
    bioAr: 'عدّاء مسافات ومهتم بالإلكترونيات.',
    role: 'user',
    privacyLastSeen: 'friends',
    lastSeenAt: '6m ago',
    isOnlineChat: false,
    location: {
      state: 'stale',
      precision: 'exact',
      lat: 31.9314,
      lng: 35.8645,
      mapX: 28,
      mapY: 69,
      accuracyMeters: 14,
      batteryLevel: 37,
      distanceKm: 4.1,
      updatedMinutesAgo: 6,
      areaLabel: 'Dabouq Ridge',
      areaLabelAr: 'تلال دابوق',
    },
    shareToFriend: {
      isActive: true,
      precision: 'exact',
      expiresIn: '15m',
    },
  },
  {
    id: 'u-zaid',
    username: 'zaid_h',
    displayName: 'Zaid Al-Harbi',
    displayNameAr: 'زيد الحربي',
    avatarUrl: null,
    bio: 'Coffee roaster & photographer.',
    bioAr: 'محمص قهوة ومصور فوتوغرافي.',
    role: 'user',
    privacyLastSeen: 'nobody',
    lastSeenAt: '22m ago',
    isOnlineChat: false,
    location: {
      state: 'paused',
      precision: 'approximate',
      lat: 31.9452,
      lng: 35.9321,
      mapX: 74,
      mapY: 66,
      accuracyMeters: 500,
      batteryLevel: 19,
      distanceKm: 5.6,
      updatedMinutesAgo: 22,
      areaLabel: 'Jabal Al-Weibdeh',
      areaLabelAr: 'جبل اللويبدة',
    },
    shareToFriend: {
      isActive: false,
      precision: 'approximate',
      expiresIn: 'until_stopped',
    },
  },
  {
    id: 'u-sami',
    username: 'sami_n',
    displayName: 'Sami Nassar',
    displayNameAr: 'سامي نصار',
    avatarUrl: null,
    bio: 'Security researcher · Chat-only visibility.',
    bioAr: 'باحث أمني · تواصل عبر المحادثات فقط.',
    role: 'user',
    privacyLastSeen: 'everyone',
    lastSeenAt: 'Just now',
    isOnlineChat: true,
    location: {
      state: 'not_shared',
      precision: 'approximate',
      lat: 0,
      lng: 0,
      mapX: 50,
      mapY: 50,
      accuracyMeters: 0,
      distanceKm: 0,
      updatedMinutesAgo: 0,
      areaLabel: 'Not shared',
      areaLabelAr: 'غير مشارك',
    },
    shareToFriend: {
      isActive: false,
      precision: 'approximate',
      expiresIn: '1h',
    },
  },
];

const INITIAL_REQUESTS: FriendRequest[] = [
  {
    id: 'req-1',
    direction: 'incoming',
    createdAt: '12m ago',
    user: {
      id: 'u-layla',
      username: 'layla_h',
      displayName: 'Layla Haddad',
      displayNameAr: 'ليلى حداد',
      avatarUrl: sarahAvatar,
      bio: 'UX researcher working on urban mobility.',
      bioAr: 'باحثة تجربة مستخدم في مجال التنقل الحضري.',
      role: 'user',
      privacyLastSeen: 'friends',
      lastSeenAt: '4m ago',
    },
  },
  {
    id: 'req-2',
    direction: 'incoming',
    createdAt: '2h ago',
    user: {
      id: 'u-nour',
      username: 'nour_d',
      displayName: 'Nour Al-Din',
      displayNameAr: 'نور الدين',
      avatarUrl: null,
      bio: 'Backend architect & cycling lead.',
      bioAr: 'مهندس خوادم وقائد فريق الدراجات.',
      role: 'user',
      privacyLastSeen: 'friends',
      lastSeenAt: '1h ago',
    },
  },
  {
    id: 'req-3',
    direction: 'outgoing',
    createdAt: 'Yesterday',
    user: {
      id: 'u-rami',
      username: 'rami_f',
      displayName: 'Rami Fares',
      displayNameAr: 'رامي فارس',
      avatarUrl: null,
      bio: 'Geospatial GIS analyst.',
      bioAr: 'محلل نظم معلومات جغرافية.',
      role: 'user',
      privacyLastSeen: 'friends',
      lastSeenAt: '3h ago',
    },
  },
];

const INITIAL_BLOCKED: BlockedUser[] = [
  {
    blockedAt: '2 days ago',
    user: {
      id: 'u-kareem',
      username: 'kareem_z',
      displayName: 'Kareem Zaki',
      displayNameAr: 'كريم زكي',
      avatarUrl: null,
      bio: 'Blocked account.',
      bioAr: 'حساب محظور.',
      role: 'user',
      privacyLastSeen: 'nobody',
      lastSeenAt: 'Hidden',
    },
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-anas',
    type: 'direct',
    title: 'Anas Ahmad',
    titleAr: 'أنس أحمد',
    participantIds: ['u-adel', 'u-anas'],
    isMuted: false,
    unreadCount: 2,
    updatedAt: '09:42',
    isTyping: true,
  },
  {
    id: 'conv-group-tech',
    type: 'group',
    title: 'Jordan Tech Crew',
    titleAr: 'فريق تقنية الأردن',
    participantIds: ['u-adel', 'u-anas', 'u-omar', 'u-sami'],
    members: [
      { userId: 'u-adel', role: 'owner' },
      { userId: 'u-anas', role: 'admin' },
      { userId: 'u-omar', role: 'member' },
      { userId: 'u-sami', role: 'member' },
    ],
    isMuted: false,
    unreadCount: 3,
    updatedAt: '09:15',
  },
  {
    id: 'conv-omar',
    type: 'direct',
    title: 'Omar Khaled',
    titleAr: 'عمر خالد',
    participantIds: ['u-adel', 'u-omar'],
    isMuted: false,
    unreadCount: 0,
    updatedAt: 'Yesterday',
  },
  {
    id: 'conv-group-roadtrip',
    type: 'group',
    title: 'Weekend Roadtrip',
    titleAr: 'رحلة نهاية الأسبوع',
    participantIds: ['u-adel', 'u-anas', 'u-omar', 'u-tariq'],
    members: [
      { userId: 'u-anas', role: 'owner' },
      { userId: 'u-adel', role: 'admin' },
      { userId: 'u-omar', role: 'member' },
      { userId: 'u-tariq', role: 'member' },
    ],
    isMuted: true,
    unreadCount: 0,
    updatedAt: 'Yesterday',
  },
  {
    id: 'conv-sami',
    type: 'direct',
    title: 'Sami Nassar',
    titleAr: 'سامي نصار',
    participantIds: ['u-adel', 'u-sami'],
    isMuted: false,
    unreadCount: 1,
    updatedAt: 'Mon',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-anas': [
    {
      id: 'm-1',
      conversationId: 'conv-anas',
      senderId: 'u-anas',
      type: 'text',
      content: 'Just reached Abdoun Circle. Sharing exact GPS for the next hour while we meet up.',
      contentAr: 'وصلت للتو إلى دوار عبدون. أشارك الموقع الدقيق لساعة واحدة حتى نلتقي.',
      status: 'read',
      createdAt: '09:38',
    },
    {
      id: 'm-2',
      conversationId: 'conv-anas',
      senderId: 'u-adel',
      type: 'text',
      content: 'Got it, I can see your live ring at 0.8 km. Heading out now.',
      contentAr: 'ممتاز، أرى دائرتك الحية على بُعد 0.8 كم. أنا في طريقي الآن.',
      status: 'read',
      createdAt: '09:40',
    },
    {
      id: 'm-3',
      conversationId: 'conv-anas',
      senderId: 'u-anas',
      type: 'location',
      content: 'Shared a live location pin',
      contentAr: 'شارك بطاقة موقع حيّ',
      locationSnapshot: {
        label: 'Abdoun North · Exact GPS',
        labelAr: 'عبدون الشمالي · GPS دقيق',
        precision: 'exact',
        coords: '31.9539° N, 35.9106° E',
      },
      status: 'read',
      createdAt: '09:42',
    },
  ],
  'conv-group-tech': [
    {
      id: 'm-4',
      conversationId: 'conv-group-tech',
      senderId: 'u-sami',
      type: 'text',
      content: 'Reviewed the RLS 4-condition gate on live_locations—zero leak paths detected.',
      contentAr: 'راجعت بوابة التحقق الرباعية لـ RLS على live_locations—لا توجد أي ثغرات تسريب.',
      status: 'read',
      createdAt: '08:55',
    },
    {
      id: 'm-5',
      conversationId: 'conv-group-tech',
      senderId: 'u-omar',
      type: 'image',
      content: 'Topographic vector mockup for the map drawer.',
      contentAr: 'نموذج الشبكة الطبوغرافية لدرج الخريطة.',
      attachmentName: 'topo-hud-spec-v2.webp',
      attachmentSizeKb: 420,
      status: 'read',
      createdAt: '09:10',
    },
    {
      id: 'm-6',
      conversationId: 'conv-group-tech',
      senderId: 'u-anas',
      type: 'text',
      content: 'Clean contrast in Obsidian Radar mode! Ready for review.',
      contentAr: 'تباين ممتاز في الوضع الداكن! جاهز للمراجعة.',
      status: 'read',
      createdAt: '09:15',
    },
  ],
  'conv-omar': [
    {
      id: 'm-7',
      conversationId: 'conv-omar',
      senderId: 'u-omar',
      type: 'text',
      content: 'Switched my location mode to 500m Approximate Zone for the afternoon.',
      contentAr: 'حوّلت وضع موقعي إلى النطاق التقريبي 500 متر لفترة الظهيرة.',
      status: 'read',
      createdAt: 'Yesterday',
    },
  ],
  'conv-group-roadtrip': [
    {
      id: 'm-8',
      conversationId: 'conv-group-roadtrip',
      senderId: 'u-tariq',
      type: 'text',
      content: 'Battery is at 37%, might switch to 180s stationary heartbeat.',
      contentAr: 'البطارية 37%، قد يتحول التحديث لنبضة التوفير كل 180 ثانية.',
      status: 'read',
      createdAt: 'Yesterday',
    },
  ],
  'conv-sami': [
    {
      id: 'm-9',
      conversationId: 'conv-sami',
      senderId: 'u-sami',
      type: 'text',
      content: 'Ping me when the Phase 2.2 prototype is ready for QA.',
      contentAr: 'أخبرني عندما يصبح نموذج المرحلة 2.2 جاهزاً لاختبار الجودة.',
      status: 'read',
      createdAt: 'Mon',
    },
  ],
};

const INITIAL_REPORTS: ModerationReport[] = [
  {
    id: 'rep-101',
    reporterUsername: 'omar_k',
    targetUserId: 'u-kareem',
    targetUsername: 'kareem_z',
    reason: 'Repeated unsolicited friend requests',
    reasonAr: 'طلبات صداقة متكررة غير مرغوبة',
    details: 'User bypassed cooldown by creating alternate display name.',
    detailsAr: 'حاول المستخدم تكرار الطلبات بعد الرفض.',
    status: 'open',
    createdAt: '2026-11-23T09:12:00Z',
  },
  {
    id: 'rep-102',
    reporterUsername: 'anas_dev',
    targetUserId: 'u-spam-88',
    targetUsername: 'promo_bot_88',
    reason: 'Automated promotional messaging',
    reasonAr: 'رسائل ترويجية آلية',
    details: 'Sent external phishing link inside group invitation note.',
    detailsAr: 'إرسال رابط خارجي مشبوه ضمن ملاحظة الدعوة.',
    status: 'open',
    createdAt: '2026-11-23T10:04:00Z',
  },
  {
    id: 'rep-100',
    reporterUsername: 'tariq_m',
    targetUserId: 'u-guest-12',
    targetUsername: 'guest_temp_12',
    reason: 'Impersonation report',
    reasonAr: 'بلاغ انتحال شخصية',
    details: 'Verified false positive after identity review.',
    detailsAr: 'تم التحقق وثبت أنه بلاغ غير مطابق.',
    status: 'dismissed',
    createdAt: '2026-11-22T18:40:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-4',
    actorUsername: 'adel_sec',
    action: 'REPORT_DISMISSED',
    targetUsername: 'guest_temp_12',
    timestamp: '2026-11-22T19:02:11Z',
    metadata: 'report_id=rep-100 · no_violation',
  },
  {
    id: 'aud-3',
    actorUsername: 'system_cron',
    action: 'EXPIRED_SHARES_DEACTIVATED',
    targetUsername: '*',
    timestamp: '2026-11-23T06:00:00Z',
    metadata: 'pg_cron_cleanup · rows=4',
  },
  {
    id: 'aud-2',
    actorUsername: 'adel_sec',
    action: 'RLS_POLICY_VERIFIED',
    targetUsername: 'live_locations',
    timestamp: '2026-11-23T08:15:32Z',
    metadata: 'admin_zero_access_check=PASS',
  },
];

interface MockAppContextValue {
  isAuthenticated: boolean;
  accountDeletedNotice: boolean;
  currentUser: UserProfile;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  friends: FriendRecord[];
  requests: FriendRequest[];
  blockedUsers: BlockedUser[];
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  reports: ModerationReport[];
  auditLogs: AuditLogEntry[];
  isSharingGlobal: boolean;
  ghostMode: boolean;
  globalPrecision: LocationPrecision;
  remainingSeconds: number;
  selectedFriendIdOnMap: string | null;
  selectedConversationId: string | null;
  offlineQueueMode: boolean;
  suspendedUserIds: string[];
  totalUnreadChats: number;
  pendingIncomingRequestsCount: number;
  activeBroadcastViewersCount: number;

  // Actions
  enterDemoWorkspace: () => void;
  signInAsUser: (email: string) => void;
  signUpUser: (displayName: string, username: string) => void;
  signOut: () => void;
  setSelectedFriendIdOnMap: (id: string | null) => void;
  focusFriendOnMap: (friendId: string) => void;
  setSelectedConversationId: (id: string | null) => void;
  openDirectChat: (friendId: string) => void;
  markConversationRead: (conversationId: string) => void;
  toggleGlobalSharing: (active: boolean) => void;
  toggleGhostMode: (enabled: boolean) => void;
  setGlobalPrecision: (precision: LocationPrecision) => void;
  updateFriendShare: (
    friendId: string,
    patch: Partial<OutboundLocationShare>,
  ) => void;
  setOfflineQueueMode: (enabled: boolean) => void;
  sendMessage: (
    conversationId: string,
    payload: {
      type: ChatMessage['type'];
      content: string;
      contentAr?: string;
      attachmentName?: string;
      attachmentSizeKb?: number;
      locationSnapshot?: ChatMessage['locationSnapshot'];
    },
  ) => void;
  createGroup: (title: string, memberIds: string[]) => string;
  updateGroupTitle: (conversationId: string, title: string) => void;
  toggleMuteConversation: (conversationId: string) => void;
  updateGroupMemberRole: (
    conversationId: string,
    userId: string,
    role: GroupMemberRole,
  ) => void;
  removeGroupMember: (conversationId: string, userId: string) => void;
  leaveGroup: (conversationId: string) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  submitReport: (targetUserId: string, reason: string) => void;
  resolveReport: (
    reportId: string,
    action: 'resolved' | 'dismissed' | 'suspended',
  ) => void;
  updatePrivacyLastSeen: (value: LastSeenPrivacy) => void;
  deleteAccount: () => void;
}

const MockAppContext = createContext<MockAppContextValue | null>(null);

function formatNowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function MockAppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [accountDeletedNotice, setAccountDeletedNotice] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<AppTab>('map');

  const [friends, setFriends] = useState<FriendRecord[]>(INITIAL_FRIENDS);
  const [requests, setRequests] = useState<FriendRequest[]>(INITIAL_REQUESTS);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(INITIAL_BLOCKED);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [reports, setReports] = useState<ModerationReport[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [isSharingGlobal, setIsSharingGlobal] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);
  const [globalPrecision, setGlobalPrecision] = useState<LocationPrecision>('exact');
  const [remainingSeconds, setRemainingSeconds] = useState(42 * 60 + 18);
  const [selectedFriendIdOnMap, setSelectedFriendIdOnMap] = useState<string | null>('u-anas');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv-anas');
  const [offlineQueueMode, setOfflineQueueModeState] = useState(false);
  const [suspendedUserIds, setSuspendedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !isSharingGlobal || ghostMode) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, isSharingGlobal, ghostMode]);

  const activeBroadcastViewersCount = useMemo(() => {
    if (!isSharingGlobal || ghostMode) return 0;
    return friends.filter((f) => f.shareToFriend.isActive).length;
  }, [friends, isSharingGlobal, ghostMode]);

  const totalUnreadChats = useMemo(
    () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations],
  );

  const pendingIncomingRequestsCount = useMemo(
    () => requests.filter((r) => r.direction === 'incoming').length,
    [requests],
  );

  const enterDemoWorkspace = useCallback(() => {
    setAccountDeletedNotice(false);
    setCurrentUser(INITIAL_USER);
    setIsAuthenticated(true);
    setActiveTab('map');
  }, []);

  const signInAsUser = useCallback((email: string) => {
    setAccountDeletedNotice(false);
    setCurrentUser((prev) => ({
      ...prev,
      displayName: email.split('@')[0] || INITIAL_USER.displayName,
    }));
    setIsAuthenticated(true);
    setActiveTab('map');
  }, []);

  const signUpUser = useCallback((displayName: string, username: string) => {
    setAccountDeletedNotice(false);
    setCurrentUser({
      ...INITIAL_USER,
      displayName: displayName.trim() || INITIAL_USER.displayName,
      displayNameAr: displayName.trim() || INITIAL_USER.displayNameAr,
      username: username.trim().toLowerCase() || INITIAL_USER.username,
    });
    setIsAuthenticated(true);
    setActiveTab('map');
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const focusFriendOnMap = useCallback((friendId: string) => {
    setSelectedFriendIdOnMap(friendId);
    setActiveTab('map');
  }, []);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const openDirectChat = useCallback(
    (friendId: string) => {
      const existing = conversations.find(
        (c) => c.type === 'direct' && c.participantIds.includes(friendId),
      );
      if (existing) {
        setSelectedConversationId(existing.id);
        markConversationRead(existing.id);
      } else {
        const friend = friends.find((f) => f.id === friendId);
        if (friend) {
          const newId = `conv-${friend.id}`;
          const newConv: Conversation = {
            id: newId,
            type: 'direct',
            title: friend.displayName,
            titleAr: friend.displayNameAr,
            participantIds: [currentUser.id, friend.id],
            isMuted: false,
            unreadCount: 0,
            updatedAt: formatNowHHMM(),
          };
          setConversations((prev) => [newConv, ...prev]);
          setMessagesByConversation((prev) => ({ ...prev, [newId]: [] }));
          setSelectedConversationId(newId);
        }
      }
      setActiveTab('chats');
    },
    [conversations, friends, currentUser.id, markConversationRead],
  );

  const toggleGlobalSharing = useCallback((active: boolean) => {
    setIsSharingGlobal(active);
    if (active) {
      setRemainingSeconds((prev) => (prev === 0 ? 45 * 60 : prev));
    }
  }, []);

  const toggleGhostMode = useCallback((enabled: boolean) => {
    setGhostMode(enabled);
  }, []);

  const updateFriendShare = useCallback(
    (friendId: string, patch: Partial<OutboundLocationShare>) => {
      setFriends((prev) =>
        prev.map((f) =>
          f.id === friendId
            ? { ...f, shareToFriend: { ...f.shareToFriend, ...patch } }
            : f,
        ),
      );
    },
    [],
  );

  const setOfflineQueueMode = useCallback((enabled: boolean) => {
    setOfflineQueueModeState(enabled);
    if (!enabled) {
      // Flush any queued messages to sent/read when back online
      setMessagesByConversation((prev) => {
        const next: Record<string, ChatMessage[]> = {};
        for (const [convId, list] of Object.entries(prev)) {
          next[convId] = list.map((msg) =>
            msg.status === 'queued' ? { ...msg, status: 'read' } : msg,
          );
        }
        return next;
      });
    }
  }, []);

  const sendMessage = useCallback(
    (
      conversationId: string,
      payload: {
        type: ChatMessage['type'];
        content: string;
        contentAr?: string;
        attachmentName?: string;
        attachmentSizeKb?: number;
        locationSnapshot?: ChatMessage['locationSnapshot'];
      },
    ) => {
      const now = formatNowHHMM();
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        conversationId,
        senderId: currentUser.id,
        type: payload.type,
        content: payload.content,
        contentAr: payload.contentAr,
        attachmentName: payload.attachmentName,
        attachmentSizeKb: payload.attachmentSizeKb,
        locationSnapshot: payload.locationSnapshot,
        status: offlineQueueMode ? 'queued' : 'read',
        createdAt: now,
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), newMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, updatedAt: now, unreadCount: 0 } : c,
        ),
      );
    },
    [currentUser.id, offlineQueueMode],
  );

  const createGroup = useCallback(
    (title: string, memberIds: string[]) => {
      const cleanTitle = title.trim() || 'New Private Group';
      const uniqueMembers = Array.from(new Set([currentUser.id, ...memberIds]));
      const convId = `conv-grp-${Date.now()}`;
      const now = formatNowHHMM();

      const newConv: Conversation = {
        id: convId,
        type: 'group',
        title: cleanTitle,
        titleAr: cleanTitle,
        participantIds: uniqueMembers,
        members: uniqueMembers.map((uid) => ({
          userId: uid,
          role: uid === currentUser.id ? 'owner' : 'member',
        })),
        isMuted: false,
        unreadCount: 0,
        updatedAt: now,
      };

      const systemMsg: ChatMessage = {
        id: `msg-sys-${Date.now()}`,
        conversationId: convId,
        senderId: 'system',
        type: 'system',
        content: `${currentUser.displayName} created "${cleanTitle}"`,
        contentAr: `أنشأ ${currentUser.displayNameAr} مجموعة "${cleanTitle}"`,
        status: 'read',
        createdAt: now,
      };

      setConversations((prev) => [newConv, ...prev]);
      setMessagesByConversation((prev) => ({ ...prev, [convId]: [systemMsg] }));
      setSelectedConversationId(convId);
      setActiveTab('chats');
      return convId;
    },
    [currentUser.id, currentUser.displayName, currentUser.displayNameAr],
  );

  const updateGroupTitle = useCallback((conversationId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, title: clean, titleAr: clean } : c,
      ),
    );
  }, []);

  const toggleMuteConversation = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isMuted: !c.isMuted } : c,
      ),
    );
  }, []);

  const updateGroupMemberRole = useCallback(
    (conversationId: string, userId: string, role: GroupMemberRole) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId && c.members
            ? {
                ...c,
                members: c.members.map((m) =>
                  m.userId === userId ? { ...m, role } : m,
                ),
              }
            : c,
        ),
      );
    },
    [],
  );

  const removeGroupMember = useCallback((conversationId: string, userId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              participantIds: c.participantIds.filter((id) => id !== userId),
              members: c.members?.filter((m) => m.userId !== userId),
            }
          : c,
      ),
    );
  }, []);

  const leaveGroup = useCallback(
    (conversationId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    },
    [selectedConversationId],
  );

  const acceptRequest = useCallback((requestId: string) => {
    setRequests((prev) => {
      const target = prev.find((r) => r.id === requestId);
      if (target) {
        const newFriend: FriendRecord = {
          ...target.user,
          isOnlineChat: true,
          location: {
            state: 'not_shared',
            precision: 'approximate',
            lat: 31.951,
            lng: 35.912,
            mapX: 48,
            mapY: 54,
            accuracyMeters: 500,
            distanceKm: 1.9,
            updatedMinutesAgo: 0,
            areaLabel: 'Amman Central',
            areaLabelAr: 'وسط عمّان',
          },
          shareToFriend: {
            isActive: false,
            precision: 'approximate',
            expiresIn: '1h',
          },
        };
        setFriends((curr) =>
          curr.some((f) => f.id === newFriend.id) ? curr : [newFriend, ...curr],
        );
      }
      return prev.filter((r) => r.id !== requestId);
    });
  }, []);

  const declineRequest = useCallback((requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const cancelRequest = useCallback((requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const removeFriend = useCallback(
    (friendId: string) => {
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
      if (selectedFriendIdOnMap === friendId) {
        setSelectedFriendIdOnMap(null);
      }
    },
    [selectedFriendIdOnMap],
  );

  const blockUser = useCallback(
    (userId: string) => {
      // ADR-003 Automated Block Cascading:
      // 1) Remove friendship & disable location shares
      // 2) Cancel pending requests
      // 3) Clear map pin selection if blocked user was selected
      // 4) Insert into blockedUsers
      const fromFriends = friends.find((f) => f.id === userId);
      const fromRequests = requests.find((r) => r.user.id === userId)?.user;
      const targetProfile: UserProfile | undefined = fromFriends ?? fromRequests;

      setFriends((prev) => prev.filter((f) => f.id !== userId));
      setRequests((prev) => prev.filter((r) => r.user.id !== userId));
      if (selectedFriendIdOnMap === userId) {
        setSelectedFriendIdOnMap(null);
      }

      if (targetProfile) {
        setBlockedUsers((prev) =>
          prev.some((b) => b.user.id === userId)
            ? prev
            : [{ user: targetProfile, blockedAt: 'Just now' }, ...prev],
        );
      }
    },
    [friends, requests, selectedFriendIdOnMap],
  );

  const unblockUser = useCallback((userId: string) => {
    setBlockedUsers((prev) => prev.filter((b) => b.user.id !== userId));
  }, []);

  const submitReport = useCallback(
    (targetUserId: string, reason: string) => {
      const friend = friends.find((f) => f.id === targetUserId);
      if (!friend) return;
      const newReport: ModerationReport = {
        id: `rep-${Math.floor(103 + Math.random() * 890)}`,
        reporterUsername: currentUser.username,
        targetUserId: friend.id,
        targetUsername: friend.username,
        reason: reason.trim() || 'Safety policy concern',
        reasonAr: reason.trim() || 'مخالفة سياسة الأمان',
        details: 'Submitted from Friends Directory.',
        detailsAr: 'تم الإبلاغ من دليل الأصدقاء.',
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      setReports((prev) => [newReport, ...prev]);
    },
    [friends, currentUser.username],
  );

  const resolveReport = useCallback(
    (reportId: string, action: 'resolved' | 'dismissed' | 'suspended') => {
      const target = reports.find((r) => r.id === reportId);
      if (!target) return;

      const nextStatus: ModerationReport['status'] =
        action === 'dismissed' ? 'dismissed' : 'resolved';

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r)),
      );

      if (action === 'suspended') {
        setSuspendedUserIds((prev) =>
          prev.includes(target.targetUserId) ? prev : [...prev, target.targetUserId],
        );
      }

      const actionName =
        action === 'suspended'
          ? 'USER_SUSPENDED'
          : action === 'resolved'
            ? 'REPORT_RESOLVED'
            : 'REPORT_DISMISSED';

      const auditEntry: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        actorUsername: currentUser.username,
        action: actionName,
        targetUsername: target.targetUsername,
        timestamp: new Date().toISOString(),
        metadata: `report_id=${reportId} · status=${nextStatus}`,
      };

      setAuditLogs((prev) => [auditEntry, ...prev]);
    },
    [reports, currentUser.username],
  );

  const updatePrivacyLastSeen = useCallback((value: LastSeenPrivacy) => {
    setCurrentUser((prev) => ({ ...prev, privacyLastSeen: value }));
  }, []);

  const deleteAccount = useCallback(() => {
    setFriends(INITIAL_FRIENDS);
    setRequests(INITIAL_REQUESTS);
    setBlockedUsers(INITIAL_BLOCKED);
    setConversations(INITIAL_CONVERSATIONS);
    setMessagesByConversation(INITIAL_MESSAGES);
    setReports(INITIAL_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsSharingGlobal(false);
    setGhostMode(false);
    setAccountDeletedNotice(true);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<MockAppContextValue>(
    () => ({
      isAuthenticated,
      accountDeletedNotice,
      currentUser,
      activeTab,
      setActiveTab,
      friends,
      requests,
      blockedUsers,
      conversations,
      messagesByConversation,
      reports,
      auditLogs,
      isSharingGlobal,
      ghostMode,
      globalPrecision,
      remainingSeconds,
      selectedFriendIdOnMap,
      selectedConversationId,
      offlineQueueMode,
      suspendedUserIds,
      totalUnreadChats,
      pendingIncomingRequestsCount,
      activeBroadcastViewersCount,
      enterDemoWorkspace,
      signInAsUser,
      signUpUser,
      signOut,
      setSelectedFriendIdOnMap,
      focusFriendOnMap,
      setSelectedConversationId,
      openDirectChat,
      markConversationRead,
      toggleGlobalSharing,
      toggleGhostMode,
      setGlobalPrecision,
      updateFriendShare,
      setOfflineQueueMode,
      sendMessage,
      createGroup,
      updateGroupTitle,
      toggleMuteConversation,
      updateGroupMemberRole,
      removeGroupMember,
      leaveGroup,
      acceptRequest,
      declineRequest,
      cancelRequest,
      removeFriend,
      blockUser,
      unblockUser,
      submitReport,
      resolveReport,
      updatePrivacyLastSeen,
      deleteAccount,
    }),
    [
      isAuthenticated,
      accountDeletedNotice,
      currentUser,
      activeTab,
      friends,
      requests,
      blockedUsers,
      conversations,
      messagesByConversation,
      reports,
      auditLogs,
      isSharingGlobal,
      ghostMode,
      globalPrecision,
      remainingSeconds,
      selectedFriendIdOnMap,
      selectedConversationId,
      offlineQueueMode,
      suspendedUserIds,
      totalUnreadChats,
      pendingIncomingRequestsCount,
      activeBroadcastViewersCount,
      enterDemoWorkspace,
      signInAsUser,
      signUpUser,
      signOut,
      focusFriendOnMap,
      openDirectChat,
      markConversationRead,
      toggleGlobalSharing,
      toggleGhostMode,
      updateFriendShare,
      setOfflineQueueMode,
      sendMessage,
      createGroup,
      updateGroupTitle,
      toggleMuteConversation,
      updateGroupMemberRole,
      removeGroupMember,
      leaveGroup,
      acceptRequest,
      declineRequest,
      cancelRequest,
      removeFriend,
      blockUser,
      unblockUser,
      submitReport,
      resolveReport,
      updatePrivacyLastSeen,
      deleteAccount,
    ],
  );

  return <MockAppContext.Provider value={value}>{children}</MockAppContext.Provider>;
}

export function useMockApp(): MockAppContextValue {
  const ctx = useContext(MockAppContext);
  if (!ctx) {
    throw new Error('useMockApp must be used within a MockAppProvider');
  }
  return ctx;
}
