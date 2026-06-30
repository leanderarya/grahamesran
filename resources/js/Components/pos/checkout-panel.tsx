import { cn } from '@/lib/utils';
import { formatRupiah, getProductLabel } from '@/lib/format';
import { Trash2, Minus, Plus } from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    sku?: string;
    stock: number | string;
    sell_price: number | string;
    workshop_price?: number | string;
    volume_liter?: number | string;
    image_url?: string;
    qty: number;
}

interface CheckoutPanelProps {
    cart: CartItem[];
    productById: Map<number, CartItem>;
    getProductPrice: (product: CartItem | null | undefined) => number;
    clearCart: () => void;
    removeItem: (id: number) => void;
    updateQty: (id: number, delta: number) => void;
    totalAmount: number;
    totalQty: number;
    isWorkshop: boolean;
    hasOpenSession: boolean;
    customerType: string;
    onCustomerTypeChange: (type: string) => void;
    onSaveDraft: () => void;
    showMobileCheckout: boolean;
    onCloseMobileCheckout: () => void;
}

export function CheckoutPanel({
    cart,
    productById,
    getProductPrice,
    clearCart,
    removeItem,
    updateQty,
    totalAmount,
    totalQty,
    isWorkshop,
    hasOpenSession,
    customerType,
    onCustomerTypeChange,
    onSaveDraft,
    showMobileCheckout,
    onCloseMobileCheckout,
}: CheckoutPanelProps) {
    return (
        <section
            className={cn(
                'flex w-[40%] min-w-[340px] flex-col border-l border-slate-200 bg-white',
                !showMobileCheckout && 'hidden lg:flex',
                showMobileCheckout && 'fixed inset-0 z-40 lg:static lg:z-auto',
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="text-sm font-bold text-slate-950">
                    Keranjang
                    {cart.length > 0 && (
                        <span className="ml-1.5 text-slate-400">
                            ({cart.length})
                        </span>
                    )}
                </div>
                {cart.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
                {cart.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                        <div className="text-3xl">🛒</div>
                        <div className="mt-3 text-sm font-semibold text-slate-500">
                            Keranjang kosong
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                            Tap produk untuk mulai
                        </div>
                    </div>
                )}

                {cart.map((item, index) => {
                    const product = productById.get(item.id) || item;
                    const price = getProductPrice(product);

                    return (
                        <div key={item.id}>
                            <div className="flex items-start gap-3 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-950 line-clamp-1">
                                        {getProductLabel(item)}
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-500">
                                        Rp {formatRupiah(price)} × {item.qty}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => updateQty(item.id, -1)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-slate-950">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() => updateQty(item.id, 1)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="text-sm font-bold text-slate-950 whitespace-nowrap">
                                    Rp {formatRupiah(price * Number(item.qty || 0))}
                                </div>
                            </div>
                            {index < cart.length - 1 && (
                                <div className="border-b border-slate-100" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-3 space-y-3">
                {/* Customer Type Toggle */}
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                    <button
                        onClick={() => onCustomerTypeChange('general')}
                        className={cn(
                            'flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors',
                            !isWorkshop
                                ? 'bg-white text-slate-950 border border-slate-200'
                                : 'text-slate-500',
                        )}
                    >
                        Umum
                    </button>
                    <button
                        onClick={() => onCustomerTypeChange('workshop')}
                        className={cn(
                            'flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors',
                            isWorkshop
                                ? 'bg-white text-amber-700 border border-slate-200'
                                : 'text-slate-500',
                        )}
                    >
                        Bengkel
                    </button>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{cart.length} item · {totalQty} pcs</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Total</span>
                    <span className="text-2xl font-bold text-slate-950">
                        Rp {formatRupiah(totalAmount)}
                    </span>
                </div>

                {/* CTA */}
                <button
                    onClick={onSaveDraft}
                    disabled={cart.length === 0}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Bayar Sekarang
                </button>
            </div>

            {/* Mobile: Back to catalog */}
            <button
                onClick={onCloseMobileCheckout}
                className="border-t border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 lg:hidden"
            >
                ← Kembali ke Katalog
            </button>
        </section>
    );
}
