import { cn } from '@/lib/utils';

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
}

export function PriceDisplay({
    amount,
    highlight = false,
    size = 'md',
    className,
}: {
    amount: number;
    highlight?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    return (
        <span
            className={cn(
                'font-bold',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-xl',
                highlight ? 'text-amber-600' : 'text-slate-900',
                className,
            )}
        >
            Rp {formatRupiah(amount)}
        </span>
    );
}
