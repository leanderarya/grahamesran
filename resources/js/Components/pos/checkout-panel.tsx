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
    onSaveDraft,
    showMobileCheckout,
    onCloseMobileCheckout,
}: CheckoutPanelProps) {
    return (
        <section
            className={cn(
                'space-y-5 border-t border-slate-200 bg-slate-100 p-4 pb-28 sm:p-5 sm:pb-32 lg:col-start-3 lg:border-t-0 lg:border-l lg:p-5 lg:pb-5 xl:p-6 xl:pb-6',
                !showMobileCheckout && 'hidden lg:block',
            )}
        >
            <div className="rounded-[2rem] bg-white p-5 shadow-sm lg:sticky lg:top-5 xl:top-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                            Keranjang
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            {cart.length} item
                        </div>
                    </div>
                    <button
                        onClick={clearCart}
                        className="rounded-2xl bg-red-50 px-3 py-3 text-sm font-bold text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 hover:shadow-md"
                    >
                        Hapus Semua
                    </button>
                </div>

                <div className="mt-5 max-h-[300px] space-y-3 overflow-y-auto pr-1 xl:max-h-[360px]">
                    {cart.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                            <div className="text-base font-bold text-slate-900">
                                Keranjang masih kosong
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-500">
                                Pilih produk di panel tengah untuk
                                mulai transaksi.
                            </div>
                        </div>
                    )}

                    {cart.map((item) => {
                        const product = productById.get(item.id) || item;
                        const price = getProductPrice(product);

                        return (
                            <div
                                key={item.id}
                                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="line-clamp-2 text-sm font-bold text-slate-900">
                                            {getProductLabel(item)}
                                        </div>
                                        <div className="mt-1 text-xs font-semibold text-slate-500">
                                            Rp {formatRupiah(price)} / item
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="rounded-2xl p-3 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 />
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQty(item.id, -1)}
                                            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                        >
                                            <Minus />
                                        </button>
                                        <div className="min-w-[48px] text-center text-lg font-bold text-slate-900">
                                            {item.qty}
                                        </div>
                                        <button
                                            onClick={() => updateQty(item.id, 1)}
                                            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                        >
                                            <Plus />
                                        </button>
                                    </div>
                                    <div className="text-lg font-bold text-slate-950">
                                        Rp {formatRupiah(price * Number(item.qty || 0))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{cart.length} Items | {totalQty} Qty</span>
                    <span className="text-lg font-bold text-slate-900">Rp {formatRupiah(totalAmount)}</span>
                </div>
                <button
                    onClick={onSaveDraft}
                    disabled={cart.length === 0}
                    className="mt-3 w-full rounded-xl bg-slate-950 px-6 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                    Lanjut ke Pembayaran
                </button>
            </div>

            <button
                onClick={onCloseMobileCheckout}
                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md lg:hidden"
            >
                Kembali ke Katalog
            </button>
        </section>
    );
}
