import { cn } from '@/lib/utils';

export function VehicleFilter({
    brands,
    selected,
    onChange,
    className,
}: {
    brands: string[];
    selected: string;
    onChange: (brand: string) => void;
    className?: string;
}) {
    return (
        <select
            value={selected}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                'rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-600 dark:bg-slate-800',
                className,
            )}
        >
            {brands.map((brand) => (
                <option key={brand} value={brand}>
                    {brand === 'all' ? 'Semua Merk' : brand}
                </option>
            ))}
        </select>
    );
}
