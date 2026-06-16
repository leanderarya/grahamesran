import { cn } from '@/lib/utils';

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn('text-xs font-semibold tracking-widest text-slate-400 uppercase', className)}>
            {children}
        </span>
    );
}
