import type { ReactNode } from 'react';
import { AlertCircle, Compass, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';

export interface LoadingSkeletonProps {
  rows?: number;
  variant?: 'list' | 'card' | 'profile';
  className?: string;
}

export function LoadingSkeleton({
  rows = 3,
  variant = 'list',
  className,
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-label="Loading content"
        className={cn(
          'rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] p-5 dark:border-white/[0.08] dark:bg-[#111418] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          className,
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#EFECE4] dark:bg-[#191E24]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-[#EFECE4] dark:bg-[#191E24]" />
              <div className="h-3 w-1/2 rounded bg-[#EFECE4]/80 dark:bg-[#191E24]/70" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 w-full rounded bg-[#EFECE4]/80 dark:bg-[#191E24]/70" />
            <div className="h-3 w-5/6 rounded bg-[#EFECE4]/80 dark:bg-[#191E24]/70" />
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div
        role="status"
        aria-label="Loading profile"
        className={cn(
          'flex items-center gap-4 rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] p-5 dark:border-white/[0.08] dark:bg-[#111418] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          className,
        )}
      >
        <div className="h-14 w-14 animate-pulse rounded-full bg-[#EFECE4] dark:bg-[#191E24]" />
        <div className="flex-1 animate-pulse space-y-2.5">
          <div className="h-4 w-36 rounded bg-[#EFECE4] dark:bg-[#191E24]" />
          <div className="h-3 w-52 rounded bg-[#EFECE4]/80 dark:bg-[#191E24]/70" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading list"
      className={cn(
        'divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] bg-[#FFFFFF] dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111418] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        className,
      )}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3.5 p-4">
          <div className="h-9 w-9 shrink-0 rounded-full bg-[#EFECE4] dark:bg-[#191E24]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-[#EFECE4] dark:bg-[#191E24]" />
            <div className="h-3 w-3/4 rounded bg-[#EFECE4]/80 dark:bg-[#191E24]/70" />
          </div>
          <div className="h-5 w-16 shrink-0 rounded-full bg-[#EFECE4]/80 dark:bg-[#191E24]/70" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'fc-topo-grid flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2DFD5] bg-[#FFFFFF] px-6 py-10 text-center',
        'dark:border-white/[0.12] dark:bg-[#111418] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        className,
      )}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2DFD5] bg-[#EFECE4] text-[#111315] dark:border-white/[0.08] dark:bg-[#191E24] dark:text-[#F3F5F7]">
        {icon ?? <Compass className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[#575D66] dark:text-[#8B949E]">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorBanner({
  title = 'Unable to load data',
  message,
  onRetry,
  retryLabel = 'Retry',
  isRetrying = false,
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center',
        'border-[#DC2626]/25 bg-[#DC2626]/[0.06] text-[#991B1B]',
        'dark:border-[#EF4444]/25 dark:bg-[#EF4444]/10 dark:text-[#FCA5A5]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626] dark:text-[#EF4444]"
          aria-hidden="true"
        />
        <div className="space-y-0.5 text-sm">
          <p className="font-semibold text-[#111315] dark:text-[#F3F5F7]">{title}</p>
          <p className="leading-relaxed text-[#7F1D1D] dark:text-[#FCA5A5]">{message}</p>
        </div>
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
          className="border-[#DC2626]/25 text-[#991B1B] hover:bg-[#DC2626]/10 dark:border-[#EF4444]/30 dark:text-[#FCA5A5] dark:hover:bg-[#EF4444]/15"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
