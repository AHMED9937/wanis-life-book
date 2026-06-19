import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-700 hover:bg-red-800 text-white'
      : 'bg-[#c9a84c] hover:bg-[#a08131] text-[#1c120a]';

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f4ecd8] border-2 border-[#c9a84c] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-[#2c1e16]">
        <div className="bg-[#2c1e16] text-[#f4ecd8] px-5 py-3 flex items-center justify-between border-b border-[#c9a84c]">
          <div className="flex items-center gap-2">
            <AlertTriangle className={variant === 'danger' ? 'text-red-400' : 'text-[#c9a84c]'} size={18} />
            <h3 className="font-amiri font-bold text-lg">{title}</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 font-cairo">
          <p className="text-sm text-[#593119] leading-relaxed">{message}</p>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-[#593119] hover:bg-black/5 rounded-md transition"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 font-bold text-sm rounded-md transition shadow-md cursor-pointer ${confirmClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
