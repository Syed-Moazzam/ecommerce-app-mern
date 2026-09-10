import { cn } from '../../lib/cn';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({ page, pages, onPageChange, className }: PaginationProps) => {
  if (pages <= 1) return null;

  return (
    <div className={cn('flex justify-center gap-2', className)}>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            'h-10 w-10 rounded-xl text-sm font-semibold transition-colors',
            p === page ? 'bg-brand-600 text-white' : 'border border-line bg-white text-ink-soft hover:bg-surface-muted'
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
};
