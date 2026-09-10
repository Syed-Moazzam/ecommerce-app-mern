import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ open, onClose, title, children, className }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={className ?? 'relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl'}>
        {title && (
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-ink" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};