import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { ButtonSize, ButtonVariant } from '@/shared/types/ui';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0066FF] text-white border border-[#0066FF] hover:bg-[#0055D6] hover:border-[#0055D6] dark:bg-[#3B82F6] dark:border-[#3B82F6] dark:hover:bg-[#2563EB] dark:hover:border-[#2563EB] dark:text-white',
  secondary:
    'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] hover:bg-[#EFECE4] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:bg-[#191E24]',
  ghost:
    'bg-transparent text-[#575D66] border border-transparent hover:bg-[#EFECE4] hover:text-[#111315] dark:text-[#8B949E] dark:hover:bg-[#191E24] dark:hover:text-[#F3F5F7]',
  danger:
    'bg-[#DC2626] text-white border border-[#DC2626] hover:bg-[#B91C1C] hover:border-[#B91C1C] dark:bg-[#EF4444] dark:border-[#EF4444] dark:hover:bg-[#DC2626] dark:hover:border-[#DC2626] dark:text-white',
  hud:
    'backdrop-blur-xl bg-white/80 text-[#111315] border border-[#E2DFD5] hover:bg-white dark:bg-[#111418]/80 dark:text-[#F3F5F7] dark:border-white/[0.1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:bg-[#191E24]/90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 cursor-pointer select-none',
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F5F0] dark:focus-visible:ring-[#3B82F6] dark:focus-visible:ring-offset-[#090B0D]',
          'disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
