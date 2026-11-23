import { useEffect, useState } from 'react';
import {
  Clock,
  Compass,
  Crosshair,
  Layers,
  MapPinOff,
  PanelBottomOpen,
  PauseCircle,
  Radar,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import omarAvatar from '@/assets/images/avatar_omar_portrait_1795444581489.jpg';
import sarahAvatar from '@/assets/images/avatar_sarah_portrait_1795444581985.jpg';
import {
  Badge,
  BottomSheet,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
  Modal,
  PrecisionSelector,
  PrivacyHudPill,
  SpatialAvatar,
  ThemeToggle,
} from '@/shared/components';
import type { LocationPrecision } from '@/shared/types/ui';

export function App() {
  const [isSharing, setIsSharing] = useState(true);
  const [precision, setPrecision] = useState<LocationPrecision>('exact');
  const [remainingSeconds, setRemainingSeconds] = useState(42 * 60 + 18);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestingLoading, setIsTestingLoading] = useState(false);
  const [isRetryingError, setIsRetryingError] = useState(false);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);
  const [emptyInvitesCount, setEmptyInvitesCount] = useState(0);

  useEffect(() => {
    if (!isSharing) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSharing]);

  const handleConfirmStopSharing = () => {
    setIsSharing(false);
    setIsStopDialogOpen(false);
  };

  const handleResumeSharing = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(45 * 60);
    }
    setIsSharing(true);
  };

  const handleTriggerLoading = () => {
    setIsTestingLoading(true);
    window.setTimeout(() => {
      setIsTestingLoading(false);
    }, 900);
  };

  const handleRetrySync = () => {
    setIsRetryingError(true);
    setRetryFeedback(null);
    window.setTimeout(() => {
      setIsRetryingError(false);
      setRetryFeedback('Channel synchronized · 0ms drift');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#111315] transition-colors duration-200 dark:bg-[#090B0D] dark:text-[#F3F5F7]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E2DFD5] bg-[#F6F5F0]/85 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#090B0D]/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#0066FF]/20 bg-[#0066FF] text-white dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="truncate text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
                Friends Connect
              </span>
              <Badge variant="approximate" mono>
                Phase 2.1
              </Badge>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        {/* Editorial Intro */}
        <section className="flex flex-col justify-between gap-4 border-b border-[#E2DFD5] pb-6 dark:border-white/[0.08] lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7] sm:text-3xl">
              Cartographic Tactile &amp; Zero-Trust HUD
            </h1>
            <p className="text-sm leading-relaxed text-[#575D66] dark:text-[#8B949E]">
              Bespoke spatial tokens, hairline surfaces, tabular telemetry, and consent-first
              location controls. Engineered with Plus Jakarta Sans, JetBrains Mono, and{' '}
              <span lang="ar" dir="rtl" className="font-medium text-[#111315] dark:text-[#F3F5F7]">
                IBM Plex Sans Arabic
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#575D66] dark:text-[#8B949E] tabular-nums">
            <span>Alabaster #F6F5F0</span>
            <span aria-hidden="true">/</span>
            <span>Obsidian #090B0D</span>
            <span aria-hidden="true">/</span>
            <span>Cobalt #0066FF</span>
          </div>
        </section>

        {/* 1. Live Telemetry HUD Preview */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
                Live Telemetry HUD Preview
              </h2>
              <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
                Floating glassmorphic HUD over a topographic grid canvas with an integrated one-tap
                kill-switch.
              </p>
            </div>
            <span className="font-mono text-xs text-[#575D66] dark:text-[#8B949E] tabular-nums">
              {isSharing
                ? precision === 'exact'
                  ? '24.7136° N · 46.6753° E · ±4m'
                  : '24.71° N · 46.68° E · 500m fuzz'
                : 'COORDINATES REDACTED'}
            </span>
          </div>

          <div className="fc-topo-grid relative flex min-h-[230px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] p-6 dark:border-white/[0.08] dark:bg-[#111418] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-10">
            {/* Subtle cartographic marker ring in background */}
            <div
              className="pointer-events-none flex flex-col items-center gap-2 pb-12 opacity-90"
              aria-hidden="true"
            >
              <div
                className={`flex items-center justify-center rounded-full border transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
                  !isSharing
                    ? 'h-14 w-14 border-dashed border-[#DC2626]/40 bg-[#DC2626]/5 dark:border-[#EF4444]/40 dark:bg-[#EF4444]/10'
                    : precision === 'exact'
                      ? 'h-14 w-14 border-[#059669]/40 bg-[#059669]/10 dark:border-[#10B981]/40 dark:bg-[#10B981]/10'
                      : 'h-24 w-24 border-dashed border-[#0066FF]/45 bg-[#0066FF]/8 dark:border-[#3B82F6]/45 dark:bg-[#3B82F6]/10'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    !isSharing
                      ? 'bg-[#DC2626] dark:bg-[#EF4444]'
                      : precision === 'exact'
                        ? 'bg-[#059669] dark:bg-[#10B981]'
                        : 'bg-[#0066FF] dark:bg-[#3B82F6]'
                  }`}
                />
              </div>
              <span className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E] tabular-nums">
                {isSharing
                  ? precision === 'exact'
                    ? 'PINPOINT TELEMETRY ACTIVE'
                    : '500M DETERMINISTIC ZONE'
                  : 'BROADCAST TERMINATED'}
              </span>
            </div>

            {/* Floating PrivacyHudPill */}
            <div className="w-full max-w-xl flex justify-center">
              <PrivacyHudPill
                isSharing={isSharing}
                precision={precision}
                activeFriendsCount={3}
                remainingSeconds={remainingSeconds}
                onStopClick={() => setIsStopDialogOpen(true)}
                onResumeClick={handleResumeSharing}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </section>

        {/* 2. Spatial Avatars & Precision Controls */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Precision Selector + Badges */}
          <div className="fc-surface rounded-2xl p-6 lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
                Precision Controls &amp; Micro-Badges
              </h2>
              <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
                Segmented precision switcher synced live with the HUD preview and semantic status
                badges.
              </p>
            </div>

            <PrecisionSelector value={precision} onChange={setPrecision} />

            <div className="space-y-2.5 border-t border-[#E2DFD5] pt-5 dark:border-white/[0.08]">
              <p className="text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
                Semantic Signal Badges
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="live"
                  pulse
                  icon={<Crosshair className="h-3 w-3" aria-hidden="true" />}
                >
                  Live · Exact GPS
                </Badge>
                <Badge
                  variant="approximate"
                  mono
                  icon={<Radar className="h-3 w-3" aria-hidden="true" />}
                >
                  500m Zone
                </Badge>
                <Badge
                  variant="stale"
                  mono
                  icon={<Clock className="h-3 w-3" aria-hidden="true" />}
                >
                  Stale · 7m ago
                </Badge>
                <Badge
                  variant="paused"
                  icon={<PauseCircle className="h-3 w-3" aria-hidden="true" />}
                >
                  Sharing Paused
                </Badge>
                <Badge
                  variant="admin"
                  mono
                  icon={<Shield className="h-3 w-3" aria-hidden="true" />}
                >
                  Admin
                </Badge>
                <Badge variant="neutral" mono>
                  @adel_se
                </Badge>
              </div>
            </div>
          </div>

          {/* Spatial Avatars */}
          <div className="fc-surface rounded-2xl p-6 lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
                Spatial Avatars &amp; Battery Telemetry
              </h2>
              <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
                SVG perimeter rings distinguish exact, approximate dashed, stale, and paused
                states with resilient initials fallback.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <div className="flex flex-col items-center gap-2.5 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/45 p-3.5 text-center dark:border-white/[0.08] dark:bg-[#191E24]/55">
                <SpatialAvatar
                  name="Sarah Al-Mansoor"
                  src={sarahAvatar}
                  size="lg"
                  status={isSharing ? 'live' : 'offline'}
                  batteryLevel={84}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    Sarah M.
                  </p>
                  <p className="font-mono text-[11px] text-[#059669] dark:text-[#10B981]">
                    {isSharing ? 'Live 84%' : 'Paused'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2.5 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/45 p-3.5 text-center dark:border-white/[0.08] dark:bg-[#191E24]/55">
                <SpatialAvatar
                  name="Omar Haddad"
                  src={omarAvatar}
                  size="lg"
                  status={precision === 'approximate' ? 'approximate' : 'live'}
                  batteryLevel={62}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    Omar H.
                  </p>
                  <p className="font-mono text-[11px] text-[#D97706] dark:text-[#F59E0B]">
                    {precision === 'approximate' ? '500m Zone' : 'Exact Pin'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2.5 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/45 p-3.5 text-center dark:border-white/[0.08] dark:bg-[#191E24]/55">
                <SpatialAvatar
                  name="Zayd Rami"
                  src="/broken-avatar-url.jpg"
                  size="lg"
                  status="stale"
                  batteryLevel={18}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    Zayd R.
                  </p>
                  <p className="font-mono text-[11px] text-[#D97706] dark:text-[#F59E0B]">
                    Stale 7m
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2.5 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/45 p-3.5 text-center dark:border-white/[0.08] dark:bg-[#191E24]/55">
                <SpatialAvatar
                  name="ليلى الحسن"
                  size="lg"
                  status="offline"
                />
                <div className="space-y-0.5">
                  <p lang="ar" dir="rtl" className="text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    ليلى الحسن
                  </p>
                  <p className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E]">
                    Offline
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2DFD5] pt-4 text-xs text-[#575D66] dark:border-white/[0.08] dark:text-[#8B949E]">
              <span>SVG perimeter ring · 1px border · deterministic initials</span>
              <span className="font-mono tabular-nums">sizes: xs / sm / md / lg / xl</span>
            </div>
          </div>
        </section>

        {/* 3. Tactile Buttons & BottomSheet / Modal Triggers */}
        <section className="fc-surface rounded-2xl p-6 space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
                Tactile Buttons &amp; Overlay Primitives
              </h2>
              <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
                Press-responsive buttons, glassmorphic HUD actions, BottomSheet drawer, and Modal
                dialogs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PanelBottomOpen className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setIsBottomSheetOpen(true)}
              >
                Open BottomSheet
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Layers className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </Button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#E2DFD5] pt-5 dark:border-white/[0.08] md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary" size="md">
                Primary Cobalt
              </Button>
              <Button variant="secondary" size="md">
                Secondary Stone
              </Button>
              <Button variant="ghost" size="md">
                Ghost Action
              </Button>
              <Button
                variant="danger"
                size="md"
                leftIcon={<MapPinOff className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setIsStopDialogOpen(true)}
              >
                Kill-Switch
              </Button>
              <Button variant="hud" size="md">
                HUD Surface
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
              <Button
                variant="secondary"
                size="sm"
                isLoading={isTestingLoading}
                onClick={handleTriggerLoading}
              >
                {isTestingLoading ? 'Syncing…' : 'Test Loading (sm)'}
              </Button>
              <Button variant="secondary" size="md">
                Medium (md)
              </Button>
              <Button variant="secondary" size="lg">
                Large (lg)
              </Button>
              <Button variant="primary" size="md" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </section>

        {/* 4. Resilience States */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
              Resilience &amp; Boundary States
            </h2>
            <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
              Standardized loading skeletons, topographic empty states, and recoverable error
              banners.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
                LoadingSkeleton
              </p>
              <LoadingSkeleton rows={3} variant="list" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
                EmptyState
              </p>
              <EmptyState
                title="No friends broadcasting nearby"
                description={
                  emptyInvitesCount > 0
                    ? `Invite sheet action clicked (${emptyInvitesCount}x). Approved friends appear here once sharing begins.`
                    : 'Only confirmed friends with active, non-expired location shares appear on your map.'
                }
                actionLabel="Invite Friend"
                onAction={() => setEmptyInvitesCount((c) => c + 1)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
                ErrorBanner
              </p>
              <div className="space-y-3">
                <ErrorBanner
                  title="Realtime channel disconnected"
                  message="Unable to reach location stream. Retry to re-establish WebSocket presence."
                  onRetry={handleRetrySync}
                  isRetrying={isRetryingError}
                />
                {retryFeedback && (
                  <p className="font-mono text-xs text-[#059669] dark:text-[#10B981]">
                    {retryFeedback}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomSheet Interactive Preview */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Sharing Precision & Visibility"
        description="Responsive mobile-first bottom sheet and desktop drawer with Escape dismissal."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsBottomSheetOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsBottomSheetOpen(false)}>
              Apply Mode
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <PrecisionSelector value={precision} onChange={setPrecision} />
          <div className="flex items-center justify-between rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2.5 text-xs dark:border-white/[0.08] dark:bg-[#191E24]/70">
            <span className="text-[#575D66] dark:text-[#8B949E]">Current HUD Broadcast</span>
            <span className="font-mono font-medium text-[#111315] dark:text-[#F3F5F7]">
              {isSharing ? (precision === 'exact' ? 'EXACT GPS' : '500M ZONE') : 'PAUSED'}
            </span>
          </div>
        </div>
      </BottomSheet>

      {/* Modal Primitive Preview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Zero-Trust Boundary Verified"
        description="Hairline-bordered modal surface with Obsidian inner top highlight and Escape handling."
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
            Acknowledge
          </Button>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/55 p-3.5 text-sm text-[#575D66] dark:border-white/[0.08] dark:bg-[#191E24]/70 dark:text-[#8B949E]">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-[#059669] dark:text-[#10B981]"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            Location shares require an active share record, confirmed friendship, no mutual block,
            and <code className="font-mono text-xs">is_paused = false</code>.
          </p>
        </div>
      </Modal>

      {/* ConfirmDialog Privacy Kill-Switch */}
      <ConfirmDialog
        isOpen={isStopDialogOpen}
        onClose={() => setIsStopDialogOpen(false)}
        onConfirm={handleConfirmStopSharing}
        title="Stop sharing live location?"
        description="All active friends will immediately lose access to your live coordinates and your marker will switch to unavailable."
        confirmLabel="Stop Sharing"
        cancelLabel="Keep Sharing"
        variant="danger"
      />
    </div>
  );
}

export default App;
