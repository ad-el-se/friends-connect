import { Languages } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';

export interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();
  const isAr = locale === 'ar';

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border p-0.5 shrink-0',
        'border-[#E2DFD5] bg-[#EFECE4] dark:border-white/[0.08] dark:bg-[#191E24]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLocale('ar')}
        aria-pressed={isAr}
        className={cn(
          'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer',
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:focus-visible:ring-[#3B82F6]',
          isAr
            ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'border border-transparent text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]',
        )}
      >
        {!compact && <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        <span>عربي</span>
      </button>

      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={!isAr}
        className={cn(
          'inline-flex h-8 items-center rounded-lg px-2.5 font-mono text-xs font-medium whitespace-nowrap cursor-pointer',
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:focus-visible:ring-[#3B82F6]',
          !isAr
            ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'border border-transparent text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]',
        )}
      >
        EN
      </button>
    </div>
  );
}
