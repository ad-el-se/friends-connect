import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  className?: string;
}

const maxWidthClasses: Record<NonNullable<ModalProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
        className="fixed inset-0 bg-[#111315]/40 backdrop-blur-sm transition-opacity dark:bg-[#090B0D]/75"
      />

      <div
        className={cn(
          'relative z-10 w-full rounded-2xl border p-6',
          'border-[#E2DFD5] bg-[#FFFFFF] text-[#111315]',
          'dark:border-white/[0.1] dark:bg-[#111418] dark:text-[#F3F5F7] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          maxWidthClasses[maxWidth],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h2
              id={titleId}
              className="text-base font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="text-sm leading-relaxed text-[#575D66] dark:text-[#8B949E]"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#575D66] transition-colors hover:bg-[#EFECE4] hover:text-[#111315] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] dark:text-[#8B949E] dark:hover:bg-[#191E24] dark:hover:text-[#F3F5F7] dark:focus-visible:ring-[#3B82F6] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">{children}</div>

        {footer && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E2DFD5] pt-4 dark:border-white/[0.08]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
