'use client';

import { useEffect } from 'react';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-slate-100 animate-scale-in space-y-4">
        <div className="text-center space-y-2">
          {isDanger && (
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              <i className="fa-solid fa-trash-can text-rose-600 text-xl" />
            </div>
          )}
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold"
          >
            <i className="fa-solid fa-xmark mr-1.5" />
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'primary' : 'primary'}
            isLoading={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-2 text-xs font-bold ${
              isDanger ? 'bg-rose-600 hover:bg-rose-500 border-none' : ''
            }`}
          >
            <i className={cn('mr-1.5', isDanger ? 'fa-solid fa-trash-can' : 'fa-solid fa-check')} />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
