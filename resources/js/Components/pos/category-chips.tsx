import { cn } from '@/lib/utils';

interface CategoryChipsProps {
    groups: { name: string; count: number }[];
    selected: string | null;
    onSelect: (category: string | null) => void;
    className?: string;
}

export function CategoryChips({
    groups,
    selected,
    onSelect,
    className,
}: CategoryChipsProps) {
    return (
        <div
            className={cn(
                'flex gap-2 overflow-x-auto scrollbar-none',
                className,
            )}
        >
            {/* "Semua" chip */}
            <button
                onClick={() => onSelect(null)}
                className={cn(
                    'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                    selected === null
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
            >
                Semua
            </button>

            {groups.map((group) => (
                <button
                    key={group.name}
                    onClick={() => onSelect(group.name)}
                    className={cn(
                        'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                        selected === group.name
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                >
                    {group.name}
                    <span className="ml-1.5 text-xs opacity-60">
                        {group.count}
                    </span>
                </button>
            ))}
        </div>
    );
}
