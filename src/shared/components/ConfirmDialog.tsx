import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/lib/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="sm"
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-3.5 text-sm',
            variant === 'danger'
              ? 'border-[#DC2626]/25 bg-[#DC2626]/[0.06] text-[#991B1B] dark:border-[#EF4444]/25 dark:bg-[#EF4444]/10 dark:text-[#FCA5A5]'
              : 'border-[#0066FF]/25 bg-[#0066FF]/[0.06] text-[#0044AA] dark:border-[#3B82F6]/25 dark:bg-[#3B82F6]/10 dark:text-[#93C5FD]',
          )}
        >
          <span className="mt-0.5 shrink-0">
            {icon ?? <ShieldAlert className="h-4 w-4" aria-hidden="true" />}
          </span>
          <p className="leading-relaxed">
            {variant === 'danger'
              ? 'This action immediately updates your zero-trust sharing boundary across all active friends.'
              : 'Please confirm before applying this update.'}
          </p>
        </div>
        {children}
      </div>
    </Modal>
  );
}
