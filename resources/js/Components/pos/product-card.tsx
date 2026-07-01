import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { useCallback, useRef } from 'react';

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
    inCartQty?: number;
    className?: string;
}

export function ProductCard({ product, customerType, onAddToCart, inCartQty = 0, className }: ProductCardProps) {
    const stock = Number(product.stock) || 0;
    const isOut = stock <= 0;
    const workshopPrice = Number(product.workshop_price) || 0;
    const sellPrice = Number(product.sell_price) || 0;
    const activePrice =
        customerType === 'workshop' && workshopPrice > 0 ? workshopPrice : sellPrice;

    const cardRef = useRef<HTMLButtonElement>(null);

    const handleClick = useCallback(() => {
        if (isOut) return;
        onAddToCart(product);
        // Trigger flash animation
        const card = cardRef.current;
        if (card) {
            card.classList.remove('cart-flash');
            // Force reflow to restart animation
            void card.offsetWidth;
            card.classList.add('cart-flash');
        }
    }, [isOut, onAddToCart, product]);

    return (
        <button
            ref={cardRef}
            type="button"
            onClick={handleClick}
            className={cn(
                'relative flex flex-col rounded-xl border p-3 text-left transition-all active:scale-[0.97]',
                isOut
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-40'
                    : inCartQty > 0
                      ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                className,
            )}
            disabled={isOut}
        >
            {/* Cart qty badge */}
            {inCartQty > 0 && (
                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {inCartQty}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                    {product.sku || 'NOSKU'}
                </div>
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
            </div>

            <div className="mt-1 flex-1 text-sm font-semibold leading-snug text-slate-950 line-clamp-2">
                {product.display_name}
            </div>

            <div className="mt-2">
                <span
                    className={cn(
                        'text-sm font-bold',
                        customerType === 'workshop' && workshopPrice > 0
                            ? 'text-amber-600'
                            : 'text-slate-950',
                    )}
                >
                    Rp {formatRupiah(activePrice)}
                </span>
            </div>
        </button>
    );
}
