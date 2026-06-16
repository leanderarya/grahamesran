import { cn } from '@/lib/utils';
import { PackageSearch, type LucideIcon } from 'lucide-react';

export function EmptyState({
    message,
    icon: Icon = PackageSearch,
    className,
}: {
    message: string;
    icon?: LucideIcon;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
            <Icon className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    );
}
