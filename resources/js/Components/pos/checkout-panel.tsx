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
    paymentMethod: string;
    onPaymentMethodChange: (method: string) => void;
    cashReceived: string;
    onCashReceivedChange: (value: string) => void;
    cashShortcutAmounts: number[];
    change: number;
    isWorkshop: boolean;
    hasOpenSession: boolean;
    isProcessing: boolean;
    onProcessPayment: () => void;
    showMobileCheckout: boolean;
    onCloseMobileCheckout: () => void;
}

const placeholderImage = '/images/product-placeholder.svg';
const formSurface = 'border border-slate-200 bg-white transition-all duration-200 ease-out';
const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');
const formatSignedCurrency = (value: number) =>
    `${value < 0 ? '-' : ''}Rp ${formatRupiah(Math.abs(value || 0))}`;

export function CheckoutPanel({
    cart,
    productById,
    getProductPrice,
    clearCart,
    removeItem,
    updateQty,
    totalAmount,
    paymentMethod,
    onPaymentMethodChange,
    cashReceived,
    onCashReceivedChange,
    cashShortcutAmounts,
    change,
    isWorkshop,
    hasOpenSession,
    isProcessing,
    onProcessPayment,
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
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        <img
                                            src={
                                                product.image_url ||
                                                item.image_url ||
                                                placeholderImage
                                            }
                                            alt={getProductLabel(item)}
                                            className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-cover"
                                        />
                                        <div className="min-w-0">
                                            <div className="line-clamp-2 text-sm font-bold text-slate-900">
                                                {getProductLabel(item)}
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-slate-500">
                                                Rp {formatRupiah(price)} / item
                                            </div>
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

            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                    Pembayaran
                </div>

                <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
                    <div className="text-sm font-semibold text-slate-400">
                        Total tagihan
                    </div>
                    <div className="mt-2 text-3xl font-bold">
                        Rp {formatRupiah(totalAmount)}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                        { id: 'cash', label: 'Tunai' },
                        { id: 'qris', label: 'QRIS' },
                        { id: 'bank', label: 'Transfer' },
                    ].map((method) => (
                        <button
                            key={method.id}
                            onClick={() => onPaymentMethodChange(method.id)}
                            className={cn(
                                'rounded-2xl px-3 py-4 text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                paymentMethod === method.id
                                    ? 'bg-slate-950 text-white'
                                    : 'bg-slate-100 text-slate-600',
                            )}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>

                {paymentMethod === 'cash' && (
                    <div className="mt-4">
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Uang Diterima
                        </label>
                        <div
                            className={cn(
                                'mt-2 flex items-center rounded-2xl px-4 py-3',
                                formSurface,
                            )}
                        >
                            <span className="text-lg font-bold text-slate-500">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={cashReceived}
                                onChange={(event) =>
                                    onCashReceivedChange(
                                        sanitizeNumericInput(event.target.value),
                                    )
                                }
                                placeholder="0"
                                className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {cashShortcutAmounts.map((amount, index) => (
                                <button
                                    key={`${amount}-${index}`}
                                    type="button"
                                    onClick={() => onCashReceivedChange(String(amount))}
                                    className={cn(
                                        'rounded-2xl border px-3 py-4 text-left text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                        Number(cashReceived || 0) === amount
                                            ? 'border-slate-950 bg-slate-950 text-white'
                                            : amount === totalAmount
                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                                    )}
                                >
                                    {amount === totalAmount ? (
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                                                Uang Pas
                                            </div>
                                            <div className="text-sm font-bold">
                                                Rp {formatRupiah(amount)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>Rp {formatRupiah(amount)}</div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div
                            className={cn(
                                'mt-3 text-sm font-bold',
                                change < 0 ? 'text-red-600' : 'text-emerald-600',
                            )}
                        >
                            {change < 0
                                ? `Kurang ${formatSignedCurrency(change)}`
                                : `Kembali Rp ${formatRupiah(change)}`}
                        </div>
                    </div>
                )}

                {paymentMethod !== 'cash' && (
                    <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                        Pembayaran non-tunai akan dianggap lunas
                        sesuai nominal total.
                    </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Mode Harga
                        </div>
                        <div className="mt-2 font-bold text-slate-950">
                            {isWorkshop ? 'Bengkel' : 'Umum'}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Status Sesi
                        </div>
                        <div className="mt-2 font-bold text-slate-950">
                            {hasOpenSession ? 'Aktif' : 'Belum dibuka'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onProcessPayment}
                    disabled={
                        !hasOpenSession ||
                        cart.length === 0 ||
                        isProcessing ||
                        (paymentMethod === 'cash' && change < 0)
                    }
                    className="mt-5 w-full rounded-3xl bg-slate-950 px-4 py-4 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isProcessing ? 'Memproses...' : 'Selesaikan Transaksi'}
                </button>

                <button
                    onClick={onCloseMobileCheckout}
                    className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md lg:hidden"
                >
                    Kembali ke Katalog
                </button>
            </div>
        </section>
    );
}
