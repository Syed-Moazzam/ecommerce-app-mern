import { cn } from '../../lib/cn';

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, value, onChange, className }: TabsProps) => (
  <div className={cn('flex gap-1 overflow-x-auto border-b border-line', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={cn(
          'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
          value === tab.value
            ? 'border-brand-600 text-brand-700'
            : 'border-transparent text-ink-muted hover:text-ink'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
