import { useMemo, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Compass,
  Lock,
  Radar,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Button,
  LanguageToggle,
  ThemeToggle,
} from '@/shared/components';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';

const TAKEN_USERNAMES = new Set(['adel_sec', 'anas_dev', 'omar_k', 'tariq_m', 'admin', 'root']);

export function AuthScreen() {
  const { t, locale } = useI18n();
  const {
    enterDemoWorkspace,
    signInAsUser,
    signUpUser,
    accountDeletedNotice,
  } = useMockApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('adel@friendsconnect.app');
  const [password, setPassword] = useState('••••••••••••');
  const [displayName, setDisplayName] = useState(
    locale === 'ar' ? 'عادل سليمان' : 'Adel Suleiman',
  );
  const [username, setUsername] = useState('adel_new');

  const usernameStatus = useMemo(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) return 'empty';
    if (!/^[a-z0-9_]{3,20}$/.test(clean)) return 'invalid';
    if (TAKEN_USERNAMES.has(clean)) return 'taken';
    return 'available';
  }, [username]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'login') {
      signInAsUser(email);
      return;
    }
    if (usernameStatus === 'available') {
      signUpUser(displayName, username);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#111315] dark:bg-[#090B0D] dark:text-[#F3F5F7]">
      {/* Top Bar */}
      <header className="border-b border-[#E2DFD5] bg-[#F6F5F0]/90 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#090B0D]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0066FF] text-white dark:bg-[#3B82F6]">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="truncate text-base font-semibold tracking-tight">
              {t('brand.name')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle compact />
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:items-stretch lg:py-12">
        {/* Start Panel: Topographic Radar & 3-Point Zero-Tracking Pledge */}
        <section className="fc-topo-grid relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] p-6 dark:border-white/[0.08] dark:bg-[#111418] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8 lg:col-span-7">
          <div className="space-y-6">
            <Badge
              variant="live"
              pulse
              icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />}
            >
              {t('auth.badge')}
            </Badge>

            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7] sm:text-4xl">
                {t('auth.heroTitle')}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[#575D66] dark:text-[#8B949E] sm:text-base">
                {t('auth.heroSubtitle')}
              </p>
            </div>

            {/* Concentric Cartographic Radar Visual */}
            <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-[#E2DFD5] bg-[#F6F5F0]/70 dark:border-white/[0.08] dark:bg-[#090B0D]/60">
              <svg
                viewBox="0 0 320 160"
                className="h-full w-full max-w-sm"
                aria-hidden="true"
              >
                <circle
                  cx="160"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-[#E2DFD5] dark:text-white/15"
                />
                <circle
                  cx="160"
                  cy="80"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  className="text-[#0066FF]/35 dark:text-[#3B82F6]/35"
                />
                <circle
                  cx="160"
                  cy="80"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  className="text-[#059669]/50 dark:text-[#10B981]/50"
                />
                <circle
                  cx="160"
                  cy="80"
                  r="5"
                  className="fill-[#059669] dark:fill-[#10B981]"
                />
                <circle
                  cx="202"
                  cy="58"
                  r="4"
                  className="fill-[#0066FF] dark:fill-[#3B82F6]"
                />
                <circle
                  cx="114"
                  cy="96"
                  r="4"
                  className="fill-[#D97706] dark:fill-[#F59E0B]"
                />
              </svg>
              <div className="absolute bottom-3 start-4 flex items-center gap-2 font-mono text-[11px] text-[#575D66] dark:text-[#8B949E] tabular-nums">
                <Radar className="h-3.5 w-3.5 text-[#059669] dark:text-[#10B981]" aria-hidden="true" />
                <span>RLS 4-GATE ACTIVE · ZERO HISTORY LOG</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 border-t border-[#E2DFD5] pt-6 dark:border-white/[0.08]">
            <p className="font-mono text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
              {t('auth.pledgeTitle')}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: t('auth.pledge1Title'), desc: t('auth.pledge1Desc') },
                { title: t('auth.pledge2Title'), desc: t('auth.pledge2Desc') },
                { title: t('auth.pledge3Title'), desc: t('auth.pledge3Desc') },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E2DFD5] bg-[#F6F5F0]/75 p-3.5 dark:border-white/[0.08] dark:bg-[#191E24]/70"
                >
                  <p className="text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#575D66] dark:text-[#8B949E]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* End Panel: Login / Sign Up + 1-Click Demo Workspace */}
        <section className="fc-surface flex flex-col justify-between rounded-2xl p-6 sm:p-8 lg:col-span-5">
          <div className="space-y-6">
            {accountDeletedNotice && (
              <div className="rounded-xl border border-[#059669]/30 bg-[#059669]/10 p-3 text-xs leading-relaxed text-[#065F46] dark:border-[#10B981]/30 dark:bg-[#10B981]/10 dark:text-[#6EE7B7]">
                {t('auth.deletedNotice')}
              </div>
            )}

            {/* Mode Tabs */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 gap-1 rounded-xl border border-[#E2DFD5] bg-[#EFECE4] p-1 dark:border-white/[0.08] dark:bg-[#191E24]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => setMode('login')}
                className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1]'
                    : 'border border-transparent text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]'
                }`}
              >
                {t('auth.loginTab')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => setMode('signup')}
                className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1]'
                    : 'border border-transparent text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]'
                }`}
              >
                {t('auth.signupTab')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="auth-display-name"
                      className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
                    >
                      {t('auth.displayNameLabel')}
                    </label>
                    <input
                      id="auth-display-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2.5 text-sm text-[#111315] outline-none transition-colors focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="auth-username"
                      className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
                    >
                      {t('auth.usernameLabel')}
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute start-3.5 font-mono text-sm text-[#575D66] dark:text-[#8B949E]">
                        @
                      </span>
                      <input
                        id="auth-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        dir="ltr"
                        className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 ps-8 pe-3.5 py-2.5 font-mono text-sm text-[#111315] outline-none transition-colors focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
                      />
                    </div>

                    {usernameStatus === 'available' && (
                      <p className="flex items-center gap-1.5 text-xs text-[#059669] dark:text-[#10B981]">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{t('auth.usernameAvailable')}</span>
                      </p>
                    )}
                    {usernameStatus === 'taken' && (
                      <p className="flex items-center gap-1.5 text-xs text-[#DC2626] dark:text-[#EF4444]">
                        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{t('auth.usernameTaken')}</span>
                      </p>
                    )}
                    {usernameStatus === 'invalid' && (
                      <p className="flex items-center gap-1.5 text-xs text-[#D97706] dark:text-[#F59E0B]">
                        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{t('auth.usernameInvalid')}</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
                >
                  {t('auth.emailLabel')}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2.5 text-sm text-[#111315] outline-none transition-colors focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
                >
                  {t('auth.passwordLabel')}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2.5 text-sm text-[#111315] outline-none transition-colors focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={mode === 'signup' && usernameStatus !== 'available'}
                leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
              >
                {mode === 'login' ? t('auth.signInBtn') : t('auth.signUpBtn')}
              </Button>
            </form>
          </div>

          <div className="mt-6 space-y-2.5 border-t border-[#E2DFD5] pt-5 dark:border-white/[0.08]">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              leftIcon={<Sparkles className="h-4 w-4 text-[#0066FF] dark:text-[#3B82F6]" aria-hidden="true" />}
              onClick={enterDemoWorkspace}
            >
              {t('auth.demoBtn')}
            </Button>
            <p className="text-center font-mono text-[11px] text-[#575D66] dark:text-[#8B949E]">
              {t('auth.demoHint')}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
