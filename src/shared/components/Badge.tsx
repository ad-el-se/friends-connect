import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { BadgeVariant } from '@/shared/types/ui';

export interface BadgeProps {
  variant?: BadgeVariant;
  pulse?: boolean;
  mono?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  live: 'bg-[#059669]/10 text-[#059669] border-[#059669]/25 dark:bg-[#10B981]/12 dark:text-[#34D399] dark:border-[#10B981]/25',
  approximate:
    'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/25 dark:bg-[#3B82F6]/15 dark:text-[#60A5FA] dark:border-[#3B82F6]/30',
  stale:
    'bg-[#D97706]/10 text-[#B45309] border-[#D97706]/25 dark:bg-[#F59E0B]/12 dark:text-[#FBBF24] dark:border-[#F59E0B]/25',
  paused:
    'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/25 dark:bg-[#EF4444]/12 dark:text-[#F87171] dark:border-[#EF4444]/25',
  admin:
    'bg-[#111315] text-[#F3F5F7] border-[#111315] dark:bg-[#F3F5F7] dark:text-[#090B0D] dark:border-[#F3F5F7]',
  neutral:
    'bg-[#EFECE4] text-[#575D66] border-[#E2DFD5] dark:bg-[#191E24] dark:text-[#8B949E] dark:border-white/[0.08]',
};

const pulseDotClasses: Record<BadgeVariant, string> = {
  live: 'bg-[#059669] dark:bg-[#10B981]',
  approximate: 'bg-[#0066FF] dark:bg-[#3B82F6]',
  stale: 'bg-[#D97706] dark:bg-[#F59E0B]',
  paused: 'bg-[#DC2626] dark:bg-[#EF4444]',
  admin: 'bg-[#8B949E]',
  neutral: 'bg-[#575D66] dark:bg-[#8B949E]',
};

export function Badge({
  variant = 'neutral',
  pulse = false,
  mono = false,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap shrink-0 tabular-nums',
        mono && 'font-mono tracking-tight',
        variantClasses[variant],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              pulseDotClasses[variant],
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              pulseDotClasses[variant],
            )}
          />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
