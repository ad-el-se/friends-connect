import {
  Compass,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  Moon,
  Settings,
  Shield,
  Sun,
  Users,
} from 'lucide-react';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { ChatsHub } from '@/features/chat/ChatsHub';
import { FriendsDirectory } from '@/features/friends/FriendsDirectory';
import { LiveMapHub } from '@/features/location/LiveMapHub';
import { PrivacySettingsScreen } from '@/features/settings/PrivacySettingsScreen';
import { LanguageToggle, ThemeToggle } from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';
import { useTheme } from '@/shared/lib/theme';
import type { AppTab } from '@/shared/types/domain';

export function AppShell() {
  const { t, locale, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const {
    currentUser,
    activeTab,
    setActiveTab,
    totalUnreadChats,
    pendingIncomingRequestsCount,
    reports,
    signOut,
  } = useMockApp();

  const openReportsCount = reports.filter((r) => r.status === 'open').length;

  const navItems: Array<{
    id: AppTab;
    label: string;
    icon: typeof MapIcon;
    badge?: number;
  }> = [
    { id: 'map', label: t('nav.map'), icon: MapIcon },
    {
      id: 'chats',
      label: t('nav.chats'),
      icon: MessageSquare,
      badge: totalUnreadChats,
    },
    {
      id: 'friends',
      label: t('nav.friends'),
      icon: Users,
      badge: pendingIncomingRequestsCount,
    },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    ...(currentUser.role === 'admin'
      ? [
          {
            id: 'admin' as const,
            label: t('nav.admin'),
            icon: Shield,
            badge: openReportsCount,
          },
        ]
      : []),
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'map':
        return <LiveMapHub />;
      case 'chats':
        return <ChatsHub />;
      case 'friends':
        return <FriendsDirectory />;
      case 'settings':
        return <PrivacySettingsScreen />;
      case 'admin':
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#111315] dark:bg-[#090B0D] dark:text-[#F3F5F7]">
      {/* Desktop Slim 72px Navigation Rail pinned to start-0 */}
      <aside
        aria-label="Primary navigation"
        className="fixed inset-y-0 start-0 z-40 hidden w-[72px] flex-col items-center justify-between border-e border-[#E2DFD5] bg-[#FFFFFF] py-4 lg:flex dark:border-white/[0.08] dark:bg-[#111418]"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Brand Emblem */}
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            title={t('brand.name')}
            aria-label={t('brand.name')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066FF] text-white cursor-pointer transition-transform active:scale-95 dark:bg-[#3B82F6]"
          >
            <Compass className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:focus-visible:ring-[#3B82F6]',
                    isActive
                      ? 'border-[#0066FF]/25 bg-[#0066FF]/10 text-[#0066FF] dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]'
                      : 'border-transparent text-[#575D66] hover:bg-[#EFECE4] hover:text-[#111315] dark:text-[#8B949E] dark:hover:bg-[#191E24] dark:hover:text-[#F3F5F7]',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -end-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0066FF] px-1 font-mono text-[10px] font-semibold text-white tabular-nums dark:bg-[#3B82F6]">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip */}
                  <span
                    role="tooltip"
                    className="pointer-events-none invisible absolute start-[calc(100%+10px)] z-50 rounded-lg border border-[#E2DFD5] bg-[#FFFFFF] px-2.5 py-1 text-xs font-medium text-[#111315] whitespace-nowrap opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7]"
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rail Bottom Controls: Language, Theme, Sign Out */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            aria-label="Toggle language"
            className="flex h-10 w-11 items-center justify-center rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/70 font-mono text-[11px] font-semibold text-[#111315] hover:bg-[#EFECE4] cursor-pointer dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:hover:bg-[#222830]"
          >
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            className="flex h-10 w-11 items-center justify-center rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/70 text-[#111315] hover:bg-[#EFECE4] cursor-pointer dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:hover:bg-[#222830]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-[#0066FF]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={signOut}
            title={t('nav.signOut')}
            aria-label={t('nav.signOut')}
            className="flex h-10 w-11 items-center justify-center rounded-xl border border-transparent text-[#DC2626] hover:bg-[#DC2626]/10 cursor-pointer dark:text-[#EF4444] dark:hover:bg-[#EF4444]/15"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Mobile Compact Header (< lg) */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[#E2DFD5] bg-[#FFFFFF]/90 px-3 backdrop-blur-xl lg:hidden dark:border-white/[0.08] dark:bg-[#111418]/90">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0066FF] text-white dark:bg-[#3B82F6]">
            <Compass className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="truncate text-sm font-semibold">{t('brand.name')}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageToggle compact />
          <ThemeToggle compact />
          <button
            type="button"
            onClick={signOut}
            aria-label={t('nav.signOut')}
            title={t('nav.signOut')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2DFD5] text-[#DC2626] dark:border-white/[0.08] dark:text-[#EF4444] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-16 lg:pb-0 lg:ps-[72px]">{renderScreen()}</main>

      {/* Mobile Thumb-Zone Glassmorphic Bottom Bar (64px) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[#E2DFD5] bg-white/85 px-2 backdrop-blur-xl lg:hidden dark:border-white/[0.08] dark:bg-[#111418]/85"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors',
                isActive
                  ? 'text-[#0066FF] dark:text-[#3B82F6]'
                  : 'text-[#575D66] dark:text-[#8B949E]',
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0066FF] px-1 font-mono text-[9px] font-semibold text-white tabular-nums dark:bg-[#3B82F6]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="max-w-[64px] truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
