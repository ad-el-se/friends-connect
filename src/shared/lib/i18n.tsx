import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Locale = 'en' | 'ar';

const STORAGE_KEY = 'fc-locale';

const en = {
  // Brand & Navigation
  'brand.name': 'Friends Connect',
  'brand.tagline': 'Private Communication & Consent-Based Live Location',
  'nav.map': 'Map Hub',
  'nav.chats': 'Chats',
  'nav.friends': 'Friends',
  'nav.settings': 'Privacy & Settings',
  'nav.admin': 'Admin Console',
  'nav.signOut': 'Sign Out',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'lang.ar': 'عربي',
  'lang.en': 'EN',

  // Common
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.search': 'Search',
  'common.retry': 'Retry',
  'common.justNow': 'Just now',
  'common.minutesAgo': '{{count}}m ago',
  'common.kmAway': '{{km}} km away',
  'common.you': 'You',
  'common.online': 'Online',
  'common.offline': 'Offline',
  'common.typing': 'typing…',

  // HUD & Precision
  'hud.liveExact': 'Live · Exact GPS',
  'hud.liveApprox': 'Live · 500m Zone',
  'hud.paused': 'Sharing Paused',
  'hud.ghostActive': 'Ghost Freeze Active',
  'hud.friendSingle': 'friend',
  'hud.friendPlural': 'friends',
  'hud.stop': 'Stop',
  'hud.resume': 'Resume',
  'hud.stopTitle': 'Stop sharing live location?',
  'hud.stopDesc':
    'All active friends will immediately lose access to your live coordinates and your marker will switch to unavailable.',
  'hud.stopConfirm': 'Stop Sharing',
  'hud.keepSharing': 'Keep Sharing',
  'precision.exactLabel': 'Exact GPS',
  'precision.exactTelemetry': 'Pinpoint',
  'precision.exactDesc':
    'Shares your live GPS coordinates (lat, lng, accuracy_meters) directly with selected friends.',
  'precision.approxLabel': 'Approximate',
  'precision.approxTelemetry': '500m Zone',
  'precision.approxDesc':
    'Applies deterministic 500m spatial jitter server-side before exposing your neighborhood zone.',

  // Auth Screen
  'auth.badge': 'Zero-Trust Location & Messaging',
  'auth.heroTitle': 'Share where you are only with people you choose.',
  'auth.heroSubtitle':
    'Friends Connect enforces consent-first visibility at every layer. No hidden history trails, no silent background tracking.',
  'auth.pledgeTitle': 'Three-Point Zero-Tracking Pledge',
  'auth.pledge1Title': 'Explicit Opt-In Only',
  'auth.pledge1Desc': 'Location sharing is disabled by default until you authorize specific friends.',
  'auth.pledge2Title': 'Revocable in One Tap',
  'auth.pledge2Desc': 'Kill-switch HUD and Ghost Freeze halt coordinate broadcasts immediately.',
  'auth.pledge3Title': 'Single-Row Live State',
  'auth.pledge3Desc': 'Only your current position is stored—never an archive of past movements.',
  'auth.loginTab': 'Sign In',
  'auth.signupTab': 'Create Account',
  'auth.emailLabel': 'Email address',
  'auth.passwordLabel': 'Password',
  'auth.displayNameLabel': 'Display name',
  'auth.usernameLabel': 'Username',
  'auth.usernameAvailable': 'Username is available',
  'auth.usernameTaken': 'Username is already taken',
  'auth.usernameInvalid': 'Use 3–20 lowercase letters, numbers, or underscores',
  'auth.signInBtn': 'Sign In to Workspace',
  'auth.signUpBtn': 'Create Private Account',
  'auth.demoBtn': 'Enter Demo Workspace',
  'auth.demoHint': 'Instant preview as @adel_sec (Admin + User views)',
  'auth.deletedNotice': 'Demo account reset complete. Sign in anytime to restart the workspace.',

  // Live Map Hub
  'map.title': 'Live Map Hub',
  'map.activeCount': '{{count}} sharing live',
  'map.friendsListTitle': 'Active Friends',
  'map.friendsListSubtitle': 'Tap any friend to center the map and inspect precision state.',
  'map.centerOnMe': 'Center on me',
  'map.zoomIn': 'Zoom in',
  'map.zoomOut': 'Zoom out',
  'map.filterAll': 'All',
  'map.filterLive': 'Live',
  'map.statusLiveExact': 'Live • Exact GPS',
  'map.statusApprox': 'Approximate • 500m Zone',
  'map.statusStale': 'Stale • {{m}}m ago',
  'map.statusPaused': 'Unavailable • {{m}}m ago',
  'map.statusNotShared': 'Location not shared',
  'map.messageAction': 'Message',
  'map.precisionLabel': 'Precision',
  'map.distanceLabel': 'Distance',
  'map.updatedLabel': 'Last Update',
  'map.accuracyLabel': 'Accuracy',
  'map.emptyTitle': 'No visible friend markers',
  'map.emptyDesc': 'Friends who share their location with you will appear on this topographic radar.',

  // Chats Hub
  'chats.title': 'Chats',
  'chats.searchPlaceholder': 'Search conversations or messages…',
  'chats.filterAll': 'All',
  'chats.filterDirect': 'Direct',
  'chats.filterGroups': 'Groups',
  'chats.newGroup': 'New Group',
  'chats.back': 'Back',
  'chats.viewLocation': 'View Live Location',
  'chats.groupDetails': 'Group Details',
  'chats.offlineToggle': 'Offline Queue',
  'chats.offlineBanner':
    'Offline Queue simulated: outgoing messages stay queued until connectivity returns.',
  'chats.queuedStatus': 'Queued offline',
  'chats.sentStatus': 'Sent',
  'chats.readStatus': 'Read',
  'chats.inputPlaceholder': 'Write an encrypted message…',
  'chats.send': 'Send',
  'chats.attachImage': 'Attach Image',
  'chats.shareLocation': 'Share Location Card',
  'chats.fileTooLarge': 'Attachment rejected: image exceeds the 5 MB security policy limit.',
  'chats.invalidMime': 'Unsupported file type: only JPEG, PNG, and WebP images are permitted.',
  'chats.emptyTitle': 'Select a conversation',
  'chats.emptyDesc': 'Choose a direct friend chat or group thread to inspect real-time messaging.',
  'chats.membersCount': '{{count}} members',
  'chats.mutedBadge': 'Muted',

  // Group Drawer
  'group.createTitle': 'Create Group Chat',
  'group.createDesc': 'Start an encrypted group room with confirmed friends.',
  'group.manageTitle': 'Group Details & Roles',
  'group.manageDesc': 'Manage title, mute state, member permissions, and membership.',
  'group.titleLabel': 'Group Title',
  'group.titlePlaceholder': 'e.g. Amman Hiking Club',
  'group.selectMembers': 'Select Friends',
  'group.createBtn': 'Create Group',
  'group.saveTitleBtn': 'Save Title',
  'group.muteNotifications': 'Mute Notifications',
  'group.muteDesc': 'Silence push alerts while keeping unread badges updated.',
  'group.membersHeader': 'Members',
  'group.roleOwner': 'Owner',
  'group.roleAdmin': 'Admin',
  'group.roleMember': 'Member',
  'group.promote': 'Make Admin',
  'group.demote': 'Set Member',
  'group.removeMember': 'Remove',
  'group.leaveBtn': 'Leave Group',
  'group.leaveConfirmTitle': 'Leave this group?',
  'group.leaveConfirmDesc': 'You will no longer receive messages from this group unless re-invited.',

  // Friends Directory
  'friends.title': 'Friends & Boundaries',
  'friends.subtitle': 'Manage confirmed friendships, pending requests, and strict block isolation.',
  'friends.searchPlaceholder': 'Search by display name or @username…',
  'friends.tabFriends': 'Friends',
  'friends.tabRequests': 'Requests',
  'friends.tabBlocked': 'Blocked Users',
  'friends.message': 'Message',
  'friends.shareShortcut': 'Location Share',
  'friends.remove': 'Remove',
  'friends.block': 'Block',
  'friends.report': 'Report',
  'friends.incoming': 'Incoming Requests',
  'friends.outgoing': 'Outgoing Requests',
  'friends.accept': 'Accept',
  'friends.decline': 'Decline',
  'friends.cancelReq': 'Cancel',
  'friends.unblock': 'Unblock',
  'friends.blockTitle': 'Block {{name}}?',
  'friends.blockDesc':
    'Blocking atomically removes friendship, cancels requests, and revokes all active location shares between both accounts.',
  'friends.blockConfirm': 'Block User',
  'friends.blockIsolationNotice':
    'ADR-003 Automatic Block Cascading: Blocked users cannot see your profile, send messages, or read live coordinates.',
  'friends.reportTitle': 'Submit Moderation Report',
  'friends.reportDesc': 'Reports are reviewed by admins without exposing private chats or GPS history.',
  'friends.reportReason': 'Reason',
  'friends.reportSubmit': 'Submit Report',
  'friends.reportSent': 'Report submitted to the moderation queue.',
  'friends.emptyFriends': 'No matching friends',
  'friends.emptyFriendsDesc': 'Try adjusting your search query or accept pending friend requests.',
  'friends.emptyRequests': 'No pending requests',
  'friends.emptyRequestsDesc': 'Incoming and outgoing friend invitations appear here.',
  'friends.emptyBlocked': 'No blocked users',
  'friends.emptyBlockedDesc': 'Users you block will be isolated from your friends and map.',

  // Privacy & Settings Screen
  'settings.title': 'Privacy & Location Control Center',
  'settings.subtitle':
    'Granular per-friend sharing permissions, global Ghost Freeze mode, and account lifecycle.',
  'settings.ghostTitle': 'Global Ghost / Freeze Mode',
  'settings.ghostDesc':
    'Freezes all outbound coordinate updates immediately and shows your status as Paused to every viewer.',
  'settings.ghostActiveBadge': 'Freeze Active',
  'settings.ghostOffBadge': 'Normal Broadcast',
  'settings.matrixTitle': 'Per-Friend Location Sharing Matrix',
  'settings.matrixSubtitle': 'Control exactly who sees your location, at what precision, and for how long.',
  'settings.exp15m': '15 min',
  'settings.exp1h': '1 hour',
  'settings.exp8h': '8 hours',
  'settings.expUntil': 'Until stopped',
  'settings.profilePrivacyTitle': 'Profile & Last Seen Privacy',
  'settings.lastSeenLabel': 'Who can see your Last Seen timestamp',
  'settings.lastSeenEveryone': 'Everyone',
  'settings.lastSeenFriends': 'Friends Only',
  'settings.lastSeenNobody': 'Nobody',
  'settings.appearanceTitle': 'Appearance & Language',
  'settings.themeLabel': 'Color Theme',
  'settings.languageLabel': 'Interface Language',
  'settings.dangerTitle': 'Danger Zone',
  'settings.dangerDesc':
    'Permanently delete your profile, active location shares, friendships, and device tokens.',
  'settings.deleteBtn': 'Delete Account',
  'settings.deleteModalTitle': 'Confirm Permanent Account Deletion',
  'settings.deleteModalDesc':
    'Type your username ({{username}}) to confirm cascading removal of your demo workspace.',
  'settings.deleteInputLabel': 'Type {{username}} to confirm',
  'settings.deleteConfirmBtn': 'Permanently Delete',

  // Admin Dashboard
  'admin.title': 'Admin Moderation & Audit Console',
  'admin.subtitle': 'Moderation triage and immutable security audit logging.',
  'admin.privacyBannerTitle': 'Zero-Access Privacy Guarantee',
  'admin.privacyBannerDesc':
    'Row-Level Security strictly forbids system admins from reading private user messages or querying another user’s live_locations coordinates.',
  'admin.kpiUsers': 'Total Users',
  'admin.kpiReports': 'Open Reports',
  'admin.kpiHealth': 'System Health',
  'admin.healthNominal': '99.98% Nominal',
  'admin.reportsTitle': 'Reports Triage Queue',
  'admin.colTarget': 'Reported User',
  'admin.colReporter': 'Reporter',
  'admin.colReason': 'Reason',
  'admin.colStatus': 'Status',
  'admin.colActions': 'Actions',
  'admin.resolve': 'Resolve',
  'admin.dismiss': 'Dismiss',
  'admin.suspend': 'Suspend',
  'admin.statusOpen': 'Open',
  'admin.statusResolved': 'Resolved',
  'admin.statusDismissed': 'Dismissed',
  'admin.suspendedTag': 'Suspended',
  'admin.auditTitle': 'Immutable Audit Logs',
  'admin.auditSubtitle': 'Append-only moderation trail recorded in UTC ISO timestamps.',
  'admin.colTimestamp': 'Timestamp',
  'admin.colActor': 'Actor',
  'admin.colAction': 'Action',
  'admin.colMetadata': 'Metadata',
} as const;

export type TranslationKey = keyof typeof en;

const ar: Record<TranslationKey, string> = {
  // Brand & Navigation
  'brand.name': 'Friends Connect',
  'brand.tagline': 'تواصل خاص ومشاركة موقع حيّ بالموافقة الصريحة',
  'nav.map': 'الخريطة الحية',
  'nav.chats': 'المحادثات',
  'nav.friends': 'الأصدقاء',
  'nav.settings': 'الخصوصية والإعدادات',
  'nav.admin': 'لوحة المشرف',
  'nav.signOut': 'تسجيل الخروج',
  'theme.light': 'فاتح',
  'theme.dark': 'داكن',
  'lang.ar': 'عربي',
  'lang.en': 'EN',

  // Common
  'common.cancel': 'إلغاء',
  'common.confirm': 'تأكيد',
  'common.close': 'إغلاق',
  'common.save': 'حفظ',
  'common.search': 'بحث',
  'common.retry': 'إعادة المحاولة',
  'common.justNow': 'الآن',
  'common.minutesAgo': 'منذ {{count}} د',
  'common.kmAway': 'على بُعد {{km}} كم',
  'common.you': 'أنت',
  'common.online': 'متصل',
  'common.offline': 'غير متصل',
  'common.typing': 'يكتب الآن…',

  // HUD & Precision
  'hud.liveExact': 'مباشر · GPS دقيق',
  'hud.liveApprox': 'مباشر · نطاق 500 م',
  'hud.paused': 'المشاركة متوقفة',
  'hud.ghostActive': 'وضع التجميد نشط',
  'hud.friendSingle': 'صديق',
  'hud.friendPlural': 'أصدقاء',
  'hud.stop': 'إيقاف',
  'hud.resume': 'استئناف',
  'hud.stopTitle': 'إيقاف مشاركة الموقع الحي؟',
  'hud.stopDesc':
    'سيفقد جميع الأصدقاء النشطين فوراً إمكانية رؤية إحداثياتك الحية وسيتحول مؤشرك إلى غير متاح.',
  'hud.stopConfirm': 'إيقاف المشاركة',
  'hud.keepSharing': 'إبقاء المشاركة',
  'precision.exactLabel': 'GPS دقيق',
  'precision.exactTelemetry': 'نقطة محددة',
  'precision.exactDesc':
    'يشارك إحداثيات GPS الدقيقة مباشرة مع الأصدقاء الذين تختارهم.',
  'precision.approxLabel': 'تقريبي',
  'precision.approxTelemetry': 'نطاق 500 م',
  'precision.approxDesc':
    'يطبق إزاحة مكانية حتمية بقطر 500 متر من جهة الخادم قبل عرض منطقتك التقريبية.',

  // Auth Screen
  'auth.badge': 'موقع وتواصل بمبدأ عدم الثقة',
  'auth.heroTitle': 'شارك موقعك فقط مع من تختارهم وبإرادتك الكاملة.',
  'auth.heroSubtitle':
    'تفرض منصة Friends Connect الخصوصية في كل طبقة: بلا سجل حركة تاريخي وبلا تتبع خفي في الخلفية.',
  'auth.pledgeTitle': 'ميثاق الخصوصية الثلاثي',
  'auth.pledge1Title': 'موافقة صريحة فقط',
  'auth.pledge1Desc': 'مشاركة الموقع معطلة افتراضياً حتى تمنح الإذن لأصدقاء محددين.',
  'auth.pledge2Title': 'إلغاء بلمسة واحدة',
  'auth.pledge2Desc': 'زر الإيقاف الفوري ووضع الشبح يوقفان البث خلال لحظة.',
  'auth.pledge3Title': 'صف واحد للحالة الحية',
  'auth.pledge3Desc': 'يُحفظ موقعك الحالي فقط دون الاحتفاظ بأي مسار تاريخي سابق.',
  'auth.loginTab': 'تسجيل الدخول',
  'auth.signupTab': 'إنشاء حساب',
  'auth.emailLabel': 'البريد الإلكتروني',
  'auth.passwordLabel': 'كلمة المرور',
  'auth.displayNameLabel': 'الاسم الظاهر',
  'auth.usernameLabel': 'اسم المستخدم',
  'auth.usernameAvailable': 'اسم المستخدم متاح',
  'auth.usernameTaken': 'اسم المستخدم محجوز بالفعل',
  'auth.usernameInvalid': 'استخدم 3–20 حرفاً إنجليزياً صغيراً أو أرقاماً أو _',
  'auth.signInBtn': 'الدخول إلى مساحة العمل',
  'auth.signUpBtn': 'إنشاء حساب خاص',
  'auth.demoBtn': 'الدخول إلى النسخة التجريبية',
  'auth.demoHint': 'معاينة فورية بحساب @adel_sec (صلاحية مستخدم ومشرف)',
  'auth.deletedNotice': 'تمت إعادة ضبط الحساب التجريبي. يمكنك الدخول مجدداً في أي وقت.',

  // Live Map Hub
  'map.title': 'خريطة الموقع الحي',
  'map.activeCount': '{{count}} يشاركون الآن',
  'map.friendsListTitle': 'الأصدقاء النشطون',
  'map.friendsListSubtitle': 'اضغط على أي صديق لتمركز الخريطة ومعاينة دقة الموقع.',
  'map.centerOnMe': 'التمركز على موقعي',
  'map.zoomIn': 'تكبير',
  'map.zoomOut': 'تصغير',
  'map.filterAll': 'الكل',
  'map.filterLive': 'النشطون',
  'map.statusLiveExact': 'مباشر • GPS دقيق',
  'map.statusApprox': 'تقريبي • نطاق 500 م',
  'map.statusStale': 'قديم • منذ {{m}} د',
  'map.statusPaused': 'غير متاح • منذ {{m}} د',
  'map.statusNotShared': 'الموقع غير مشارك',
  'map.messageAction': 'مراسلة',
  'map.precisionLabel': 'الدقة',
  'map.distanceLabel': 'المسافة',
  'map.updatedLabel': 'آخر تحديث',
  'map.accuracyLabel': 'نطاق الخطأ',
  'map.emptyTitle': 'لا توجد علامات أصدقاء مرئية',
  'map.emptyDesc': 'سيظهر الأصدقاء الذين يشاركون مواقعهم معك على هذه الخريطة الطبوغرافية.',

  // Chats Hub
  'chats.title': 'المحادثات',
  'chats.searchPlaceholder': 'ابحث في المحادثات أو الرسائل…',
  'chats.filterAll': 'الكل',
  'chats.filterDirect': 'فردية',
  'chats.filterGroups': 'مجموعات',
  'chats.newGroup': 'مجموعة جديدة',
  'chats.back': 'رجوع',
  'chats.viewLocation': 'عرض الموقع الحي',
  'chats.groupDetails': 'تفاصيل المجموعة',
  'chats.offlineToggle': 'صف عدم الاتصال',
  'chats.offlineBanner':
    'محاكاة وضع عدم الاتصال: تبقى الرسائل المرسلة في الانتظار حتى يعود الاتصال.',
  'chats.queuedStatus': 'قيد الانتظار',
  'chats.sentStatus': 'أُرسلت',
  'chats.readStatus': 'مقروءة',
  'chats.inputPlaceholder': 'اكتب رسالة مشفرة…',
  'chats.send': 'إرسال',
  'chats.attachImage': 'إرفاق صورة',
  'chats.shareLocation': 'إرسال بطاقة موقع',
  'chats.fileTooLarge': 'تم رفض المرفق: حجم الصورة يتجاوز الحد الأمني البالغ 5 ميجابايت.',
  'chats.invalidMime': 'صيغة غير مدعومة: يُسمح فقط بصور JPEG وPNG وWebP.',
  'chats.emptyTitle': 'اختر محادثة',
  'chats.emptyDesc': 'حدد محادثة فردية أو جماعية لمتابعة الرسائل الفورية.',
  'chats.membersCount': '{{count}} أعضاء',
  'chats.mutedBadge': 'مكتومة',

  // Group Drawer
  'group.createTitle': 'إنشاء مجموعة جديدة',
  'group.createDesc': 'أنشئ غرفة محادثة جماعية خاصة مع أصدقائك المؤكدين.',
  'group.manageTitle': 'تفاصيل المجموعة والأدوار',
  'group.manageDesc': 'تعديل العنوان، كتم الإشعارات، إدارة الأعضاء، أو مغادرة المجموعة.',
  'group.titleLabel': 'اسم المجموعة',
  'group.titlePlaceholder': 'مثال: فريق رحلة نهاية الأسبوع',
  'group.selectMembers': 'اختر الأصدقاء',
  'group.createBtn': 'إنشاء المجموعة',
  'group.saveTitleBtn': 'حفظ الاسم',
  'group.muteNotifications': 'كتم الإشعارات',
  'group.muteDesc': 'إيقاف التنبيهات الصوتية مع بقاء عداد غير المقروء.',
  'group.membersHeader': 'الأعضاء',
  'group.roleOwner': 'مالك',
  'group.roleAdmin': 'مشرف',
  'group.roleMember': 'عضو',
  'group.promote': 'ترقية لمشرف',
  'group.demote': 'تعيين كعضو',
  'group.removeMember': 'إزالة',
  'group.leaveBtn': 'مغادرة المجموعة',
  'group.leaveConfirmTitle': 'مغادرة هذه المجموعة؟',
  'group.leaveConfirmDesc': 'لن تصلك رسائل جديدة من هذه المجموعة ما لم تتم دعوتك مجدداً.',

  // Friends Directory
  'friends.title': 'الأصدقاء والحدود الآمنة',
  'friends.subtitle': 'إدارة الصداقات المؤكدة، الطلبات المعلقة، وقائمة الحظر التلقائي.',
  'friends.searchPlaceholder': 'ابحث بالاسم أو @اسم_المستخدم…',
  'friends.tabFriends': 'الأصدقاء',
  'friends.tabRequests': 'الطلبات',
  'friends.tabBlocked': 'المحظورون',
  'friends.message': 'مراسلة',
  'friends.shareShortcut': 'مشاركة الموقع',
  'friends.remove': 'إزالة',
  'friends.block': 'حظر',
  'friends.report': 'إبلاغ',
  'friends.incoming': 'طلبات واردة',
  'friends.outgoing': 'طلبات مرسلة',
  'friends.accept': 'قبول',
  'friends.decline': 'رفض',
  'friends.cancelReq': 'إلغاء الطلب',
  'friends.unblock': 'إلغاء الحظر',
  'friends.blockTitle': 'حظر {{name}}؟',
  'friends.blockDesc':
    'يؤدي الحظر تلقائياً إلى إنهاء الصداقة، وإلغاء الطلبات المعلقة، وإيقاف جميع مشاركات الموقع بين الطرفين.',
  'friends.blockConfirm': 'تأكيد الحظر',
  'friends.blockIsolationNotice':
    'عزل الحظر التلقائي (ADR-003): لا يمكن للمستخدمين المحظورين رؤية ملفك أو مراسلتك أو قراءة إحداثياتك.',
  'friends.reportTitle': 'إرسال بلاغ للإشراف',
  'friends.reportDesc': 'تُراجع البلاغات من قبل المشرفين دون كشف المحادثات الخاصة أو المواقع.',
  'friends.reportReason': 'سبب البلاغ',
  'friends.reportSubmit': 'إرسال البلاغ',
  'friends.reportSent': 'تم إرسال البلاغ إلى قائمة المراجعة.',
  'friends.emptyFriends': 'لا يوجد أصدقاء مطابقون',
  'friends.emptyFriendsDesc': 'جرّب تعديل البحث أو قبول طلبات الصداقة الواردة.',
  'friends.emptyRequests': 'لا توجد طلبات معلقة',
  'friends.emptyRequestsDesc': 'ستظهر هنا دعوات الصداقة الواردة والصادرة.',
  'friends.emptyBlocked': 'لا يوجد مستخدمون محظورون',
  'friends.emptyBlockedDesc': 'أي مستخدم تقوم بحظره سيُعزل تلقائياً عن قائمتك وخريطتك.',

  // Privacy & Settings Screen
  'settings.title': 'مركز التحكم بالخصوصية والموقع',
  'settings.subtitle':
    'تحكم دقيق لكل صديق على حدة، ووضع الشبح العام، وإعدادات الحساب والمظهر.',
  'settings.ghostTitle': 'وضع الشبح / التجميد العام',
  'settings.ghostDesc':
    'يجمد تحديثات إحداثياتك فوراً ويظهر حالتك كمتوقفة مؤقتاً لجميع الأصدقاء.',
  'settings.ghostActiveBadge': 'التجميد نشط',
  'settings.ghostOffBadge': 'بث طبيعي',
  'settings.matrixTitle': 'مصفوفة مشاركة الموقع لكل صديق',
  'settings.matrixSubtitle': 'حدد بدقة من يرى موقعك، ومستوى الدقة، ومدة الانتهاء.',
  'settings.exp15m': '15 دقيقة',
  'settings.exp1h': 'ساعة واحدة',
  'settings.exp8h': '8 ساعات',
  'settings.expUntil': 'حتى الإيقاف',
  'settings.profilePrivacyTitle': 'خصوصية الملف وآخر ظهور',
  'settings.lastSeenLabel': 'من يمكنه رؤية وقت آخر ظهور لك',
  'settings.lastSeenEveryone': 'الجميع',
  'settings.lastSeenFriends': 'الأصدقاء فقط',
  'settings.lastSeenNobody': 'لا أحد',
  'settings.appearanceTitle': 'المظهر واللغة',
  'settings.themeLabel': 'سمة الألوان',
  'settings.languageLabel': 'لغة الواجهة',
  'settings.dangerTitle': 'منطقة الخطر',
  'settings.dangerDesc':
    'حذف حسابك نهائياً مع إزالة متتابعة للموقع الحي والصداقات ورموز الأجهزة.',
  'settings.deleteBtn': 'حذف الحساب',
  'settings.deleteModalTitle': 'تأكيد الحذف النهائي للحساب',
  'settings.deleteModalDesc':
    'اكتب اسم المستخدم ({{username}}) لتأكيد حذف مساحة العمل التجريبية.',
  'settings.deleteInputLabel': 'اكتب {{username}} للتأكيد',
  'settings.deleteConfirmBtn': 'حذف نهائي',

  // Admin Dashboard
  'admin.title': 'لوحة الإشراف وسجل التدقيق',
  'admin.subtitle': 'فرز البلاغات وسجل التدقيق الأمني غير القابل للتعديل.',
  'admin.privacyBannerTitle': 'ضمان الخصوصية المطلقة',
  'admin.privacyBannerDesc':
    'تمنع سياسات RLS المشرفين تقنياً من قراءة الرسائل الخاصة أو الاستعلام عن إحداثيات live_locations لأي مستخدم.',
  'admin.kpiUsers': 'إجمالي المستخدمين',
  'admin.kpiReports': 'بلاغات مفتوحة',
  'admin.kpiHealth': 'سلامة النظام',
  'admin.healthNominal': '99.98% مستقر',
  'admin.reportsTitle': 'طابور فرز البلاغات',
  'admin.colTarget': 'المُبلَّغ عنه',
  'admin.colReporter': 'المُبلِّغ',
  'admin.colReason': 'السبب',
  'admin.colStatus': 'الحالة',
  'admin.colActions': 'الإجراءات',
  'admin.resolve': 'معالجة',
  'admin.dismiss': 'تجاهل',
  'admin.suspend': 'تعليق الحساب',
  'admin.statusOpen': 'مفتوح',
  'admin.statusResolved': 'تمت المعالجة',
  'admin.statusDismissed': 'مرفوض',
  'admin.suspendedTag': 'موقوف',
  'admin.auditTitle': 'سجل التدقيق غير القابل للتعديل',
  'admin.auditSubtitle': 'سجل متسلسل لإجراءات الإشراف بتوقيت UTC القياسي.',
  'admin.colTimestamp': 'الوقت',
  'admin.colActor': 'المنفذ',
  'admin.colAction': 'الإجراء',
  'admin.colMetadata': 'البيانات',
};

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ar };

interface I18nContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // Ignore storage read errors
  }
  return 'en';
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : '',
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
      return interpolate(template, vars);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir,
      isRtl: locale === 'ar',
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, dir, setLocale, toggleLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}
