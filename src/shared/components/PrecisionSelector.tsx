import { Crosshair, Radar } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useOptionalI18n } from '@/shared/lib/i18n';
import type { LocationPrecision } from '@/shared/types/ui';

export interface PrecisionSelectorProps {
  value: LocationPrecision;
  onChange: (value: LocationPrecision) => void;
  disabled?: boolean;
  hideDescription?: boolean;
  className?: string;
}

export function PrecisionSelector({
  value,
  onChange,
  disabled = false,
  hideDescription = false,
  className,
}: PrecisionSelectorProps) {
  const i18n = useOptionalI18n();

  const options: Array<{
    value: LocationPrecision;
    label: string;
    telemetry: string;
    description: string;
  }> = [
    {
      value: 'exact',
      label: i18n ? i18n.t('precision.exactLabel') : 'Exact GPS',
      telemetry: i18n ? i18n.t('precision.exactTelemetry') : 'Pinpoint',
      description: i18n
        ? i18n.t('precision.exactDesc')
        : 'Shares your live GPS coordinates (lat, lng, accuracy_meters) directly with selected friends.',
    },
    {
      value: 'approximate',
      label: i18n ? i18n.t('precision.approxLabel') : 'Approximate',
      telemetry: i18n ? i18n.t('precision.approxTelemetry') : '500m Zone',
      description: i18n
        ? i18n.t('precision.approxDesc')
        : 'Applies deterministic 500m spatial jitter server-side before exposing your neighborhood zone.',
    },
  ];

  const activeIndex = value === 'approximate' ? 1 : 0;
  const activeOption = options[activeIndex];

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="radiogroup"
        aria-label="Location precision mode"
        className={cn(
          'relative grid grid-cols-2 rounded-xl border p-1',
          'bg-[#EFECE4] border-[#E2DFD5] dark:bg-[#191E24] dark:border-white/[0.08]',
          disabled && 'opacity-50 pointer-events-none',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1 bottom-1 start-1 w-[calc(50%-0.25rem)] rounded-lg border',
            'bg-[#FFFFFF] border-[#E2DFD5] dark:bg-[#111418] dark:border-white/[0.1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
            'transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
            activeIndex === 1 ? 'ltr:translate-x-full rtl:-translate-x-full' : 'translate-x-0',
          )}
        />

        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.value === 'exact' ? Crosshair : Radar;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer',
                'transition-colors duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:focus-visible:ring-[#3B82F6]',
                isSelected
                  ? 'text-[#111315] dark:text-[#F3F5F7]'
                  : 'text-[#575D66] hover:text-[#111315] dark:text-[#8B949E] dark:hover:text-[#F3F5F7]',
              )}
            >
              <Icon
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-colors duration-200',
                  isSelected
                    ? option.value === 'exact'
                      ? 'text-[#059669] dark:text-[#10B981]'
                      : 'text-[#0066FF] dark:text-[#3B82F6]'
                    : 'opacity-75',
                )}
                aria-hidden="true"
              />
              <span>{option.label}</span>
              <span className="hidden font-mono text-[11px] opacity-70 sm:inline">
                • {option.telemetry}
              </span>
            </button>
          );
        })}
      </div>

      {!hideDescription && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/55 px-3.5 py-2.5 text-xs leading-relaxed text-[#575D66] dark:border-white/[0.08] dark:bg-[#191E24]/70 dark:text-[#8B949E]">
          <span
            className={cn(
              'mt-1 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200',
              value === 'exact'
                ? 'bg-[#059669] dark:bg-[#10B981]'
                : 'bg-[#0066FF] dark:bg-[#3B82F6]',
            )}
            aria-hidden="true"
          />
          <p>{activeOption.description}</p>
        </div>
      )}
    </div>
  );
}
