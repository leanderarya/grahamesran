import { cn } from '@/lib/utils';

export function CategoryGrid({
    groups,
    onSelect,
    className,
}: {
    groups: { name: string; count: number }[];
    onSelect: (category: string) => void;
    className?: string;
}) {
    return (
        <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6', className)}>
            {groups.map((group) => (
                <button
                    key={group.name}
                    onClick={() => onSelect(group.name)}
                    className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-sm font-semibold text-slate-800 transition-all hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500"
                >
                    {group.name}
                </button>
            ))}
        </div>
    );
}
