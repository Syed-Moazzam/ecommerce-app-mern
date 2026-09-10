import { cn } from '../../lib/cn';

export const Spinner = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent',
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

export const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner className="h-8 w-8" />
  </div>
);
