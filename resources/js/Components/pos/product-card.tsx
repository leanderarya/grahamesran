import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { Plus } from 'lucide-react';

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string | null;
    image_url: string | null;
    volume_liter: number | null;
    stock: number;
    sell_price: number;
    workshop_price: number | null;
    display_name: string;
}

interface ProductCardProps {
    product: Product;
    customerType: string;
    onAddToCart: (product: Product) => void;
    className?: string;
}

export function ProductCard({ product, customerType, onAddToCart, className }: ProductCardProps) {
    const stock = Number(product.stock) || 0;
    const isOut = stock <= 0;
    const workshopPrice = Number(product.workshop_price) || 0;
    const sellPrice = Number(product.sell_price) || 0;
    const activePrice =
        customerType === 'workshop' && workshopPrice > 0 ? workshopPrice : sellPrice;

    return (
        <button
            type="button"
            onClick={() => !isOut && onAddToCart(product)}
            className={cn(
                'flex flex-col rounded-xl border p-3 text-left transition-all active:scale-[0.97]',
                isOut
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-40'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                className,
            )}
            disabled={isOut}
        >
            <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                {product.sku || 'NOSKU'}
            </div>

            <div className="mt-1 flex-1 text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
                {product.display_name}
            </div>

            <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                            stock > 5
                                ? 'bg-emerald-100 text-emerald-700'
                                : stock > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700',
                        )}
                    >
                        {stock > 0 ? `Stok: ${stock}` : 'Habis'}
                    </span>
                    <span
                        className={cn(
                            'text-sm font-bold',
                            customerType === 'workshop' && workshopPrice > 0
                                ? 'text-amber-600'
                                : 'text-slate-900',
                        )}
                    >
                        Rp {formatRupiah(activePrice)}
                    </span>
                </div>

                {!isOut && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white transition-colors hover:bg-indigo-700">
                        <Plus className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
        </button>
    );
}
