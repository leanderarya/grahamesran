import { cn } from '@/lib/utils';

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
    return (
        <span
            className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                stock > 5
                    ? 'bg-emerald-100 text-emerald-700'
                    : stock > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700',
                className,
            )}
        >
            {stock > 0 ? `Stok: ${stock}` : 'Habis'}
        </span>
    );
}
