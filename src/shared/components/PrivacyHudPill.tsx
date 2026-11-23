import { MapPinOff, Play, Radio, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import type { LocationPrecision } from '@/shared/types/ui';

export interface PrivacyHudPillProps {
  isSharing: boolean;
  precision: LocationPrecision;
  activeFriendsCount: number;
  remainingSeconds: number;
  onStopClick: () => void;
  onResumeClick?: () => void;
  className?: string;
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function PrivacyHudPill({
  isSharing,
  precision,
  activeFriendsCount,
  remainingSeconds,
  onStopClick,
  onResumeClick,
  className,
}: PrivacyHudPillProps) {
  return (
    <div
      role="region"
      aria-label="Live location privacy HUD"
      className={cn(
        'inline-flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 backdrop-blur-xl',
        'bg-white/85 border-[#E2DFD5] text-[#111315]',
        'dark:bg-[#111418]/85 dark:border-white/[0.1] dark:text-[#F3F5F7] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        {/* Live / Paused Signal */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          {isSharing ? (
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#059669] opacity-75 dark:bg-[#10B981]" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#059669] dark:bg-[#10B981]" />
            </span>
          ) : (
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-[#DC2626] dark:text-[#EF4444]"
              aria-hidden="true"
            />
          )}
          <span className="text-xs font-semibold tracking-tight">
            {isSharing
              ? precision === 'exact'
                ? 'Live · Exact GPS'
                : 'Live · 500m Zone'
              : 'Sharing Paused'}
          </span>
        </div>

        <span
          className="hidden h-4 w-px bg-[#E2DFD5] dark:bg-white/[0.08] sm:inline-block"
          aria-hidden="true"
        />

        {/* Active Viewers & Timer */}
        <div className="flex items-center gap-3 text-xs text-[#575D66] dark:text-[#8B949E]">
          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums whitespace-nowrap">
            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {isSharing ? activeFriendsCount : 0}{' '}
              {isSharing && activeFriendsCount === 1 ? 'friend' : 'friends'}
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums whitespace-nowrap">
            <Radio className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{isSharing ? formatDuration(remainingSeconds) : '00:00'}</span>
          </span>
        </div>
      </div>

      {/* Kill-Switch / Resume Action */}
      {isSharing ? (
        <Button
          variant="danger"
          size="sm"
          leftIcon={<MapPinOff className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onStopClick}
        >
          Stop
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Play className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onResumeClick}
        >
          Resume
        </Button>
      )}
    </div>
  );
}
