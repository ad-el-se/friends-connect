import { useEffect, useMemo, useState } from 'react';
import { Battery } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { SpatialAvatarSize, SpatialAvatarStatus } from '@/shared/types/ui';

export interface SpatialAvatarProps {
  name: string;
  src?: string | null;
  alt?: string;
  size?: SpatialAvatarSize;
  status?: SpatialAvatarStatus;
  batteryLevel?: number;
  className?: string;
}

const sizeSpecs: Record<
  SpatialAvatarSize,
  { outer: number; innerClass: string; textClass: string; strokeWidth: number }
> = {
  xs: { outer: 34, innerClass: 'h-6 w-6', textClass: 'text-[10px]', strokeWidth: 2 },
  sm: { outer: 44, innerClass: 'h-8 w-8', textClass: 'text-xs', strokeWidth: 2 },
  md: { outer: 54, innerClass: 'h-10 w-10', textClass: 'text-xs', strokeWidth: 2.25 },
  lg: { outer: 66, innerClass: 'h-12 w-12', textClass: 'text-sm', strokeWidth: 2.5 },
  xl: { outer: 82, innerClass: 'h-16 w-16', textClass: 'text-base', strokeWidth: 2.5 },
};

const ringStrokeClasses: Record<SpatialAvatarStatus, string> = {
  live: 'stroke-[#059669] dark:stroke-[#10B981]',
  approximate: 'stroke-[#D97706] dark:stroke-[#F59E0B]',
  stale: 'stroke-[#D97706] dark:stroke-[#F59E0B]',
  offline: 'stroke-[#C8C3B8] dark:stroke-white/20',
  none: 'stroke-[#E2DFD5] dark:stroke-white/10',
};

const statusTitles: Record<SpatialAvatarStatus, string> = {
  live: 'Live exact GPS broadcast',
  approximate: 'Approximate 500m zone sharing',
  stale: 'Stale location update',
  offline: 'Location paused or unavailable',
  none: 'Profile avatar',
};

const fallbackPalettes = [
  'bg-[#E6EEFF] text-[#0044AA] dark:bg-[#0F2142] dark:text-[#93C5FD]',
  'bg-[#E4F5EE] text-[#065F46] dark:bg-[#0A291E] dark:text-[#6EE7B7]',
  'bg-[#FDF3DF] text-[#92400E] dark:bg-[#2E1F08] dark:text-[#FCD34D]',
  'bg-[#EFECE4] text-[#111315] dark:bg-[#191E24] dark:text-[#F3F5F7]',
  'bg-[#FCE9E9] text-[#991B1B] dark:bg-[#311014] dark:text-[#FCA5A5]',
];

function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function getDeterministicPalette(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return fallbackPalettes[hash % fallbackPalettes.length];
}

export function SpatialAvatar({
  name,
  src,
  alt,
  size = 'md',
  status = 'none',
  batteryLevel,
  className,
}: SpatialAvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const spec = sizeSpecs[size];
  const radius = (spec.outer - spec.strokeWidth * 2) / 2;
  const center = spec.outer / 2;

  const initials = useMemo(() => getInitials(name), [name]);
  const paletteClass = useMemo(() => getDeterministicPalette(name), [name]);
  const showImage = Boolean(src) && !hasError;
  const clampedBattery =
    typeof batteryLevel === 'number'
      ? Math.max(0, Math.min(100, Math.round(batteryLevel)))
      : undefined;
  const isLowBattery = typeof clampedBattery === 'number' && clampedBattery <= 20;

  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center shrink-0 select-none',
        className,
      )}
      title={statusTitles[status]}
    >
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: spec.outer, height: spec.outer }}
      >
        <svg
          width={spec.outer}
          height={spec.outer}
          viewBox={`0 0 ${spec.outer} ${spec.outer}`}
          className="absolute inset-0 -rotate-90 pointer-events-none"
          aria-hidden="true"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={spec.strokeWidth}
            strokeDasharray={status === 'approximate' ? '4 3' : undefined}
            strokeLinecap="round"
            className={cn(
              'transition-colors duration-200',
              ringStrokeClasses[status],
            )}
          />
        </svg>

        <div
          className={cn(
            'relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold',
            'border border-[#E2DFD5] dark:border-white/10',
            spec.innerClass,
            spec.textClass,
            !showImage && paletteClass,
          )}
        >
          {showImage ? (
            <img
              src={src ?? undefined}
              alt={alt ?? `${name} avatar`}
              referrerPolicy="no-referrer"
              onError={() => setHasError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>
      </div>

      {typeof clampedBattery === 'number' && (
        <span
          className={cn(
            '-mt-2.5 z-10 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none tabular-nums',
            'bg-[#FFFFFF] border-[#E2DFD5] text-[#111315] dark:bg-[#111418] dark:border-white/12 dark:text-[#F3F5F7]',
            isLowBattery &&
              'border-[#DC2626]/40 text-[#DC2626] dark:border-[#EF4444]/40 dark:text-[#EF4444]',
          )}
        >
          <Battery className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
          <span>{clampedBattery}%</span>
        </span>
      )}
    </div>
  );
}
