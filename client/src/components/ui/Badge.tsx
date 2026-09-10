import { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  neutral: 'bg-slate-100 text-slate-700',
};

export const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>
    {children}
  </span>
);
