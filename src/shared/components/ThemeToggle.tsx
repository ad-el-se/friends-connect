import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/lib/theme';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      role="group"
      aria-label="Theme mode"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border p-0.5 shrink-0',
        'border-[#E2DFD5] bg-[#EFECE4] dark:border-white/[0.08] dark:bg-[#191E24]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer',
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:focus-visible:ring-[#3B82F6]',
          !isDark
            ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5]'
            : 'border border-transparent text-[#8B949E] hover:text-[#F3F5F7]',
        )}
      >
        <Sun className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer',
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:focus-visible:ring-[#3B82F6]',
          isDark
            ? 'bg-[#111418] text-[#F3F5F7] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'border border-transparent text-[#575D66] hover:text-[#111315]',
        )}
      >
        <Moon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Dark</span>
      </button>
    </div>
  );
}
