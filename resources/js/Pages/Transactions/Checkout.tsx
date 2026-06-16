import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { ArrowLeft, Banknote, QrCode, Building2 } from 'lucide-react';
import type { SharedData } from '@/types';
import {
    AppNotifications,
    notifyError,
    notifyWarning,
} from '@/Components/app-notifications';

interface DraftItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price_at_time: number;
    subtotal: number;
}

interface Draft {
    id: number;
    invoice_number: string;
    customer_type: string;
    total_amount: number;
    items: DraftItem[];
}

interface CashierSession {
    id?: number;
    opening_cash?: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    transactions_count?: number;
    opened_at?: string;
}

interface CheckoutProps {
    draft: Draft;
    cashierSession: CashierSession | null;
}

const formSurface =
    'border border-slate-200 bg-white transition-all duration-200 ease-out';

const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Tunai', icon: Banknote, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'qris', label: 'QRIS', icon: QrCode, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'bank', label: 'Transfer', icon: Building2, color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function Checkout({ draft, cashierSession }: CheckoutProps) {
    const { flash } = usePage<SharedData>().props;
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const hasOpenSession = Boolean(cashierSession?.id);

    const totalAmount = draft.total_amount;

    const change = useMemo(() => {
        if (paymentMethod !== 'cash') return 0;
        return (Number(cashReceived || 0) || 0) - totalAmount;
    }, [cashReceived, paymentMethod, totalAmount]);

    const cashShortcutAmounts = useMemo(() => {
        const roundUpToNearest = (amount: number, nearest: number) =>
            Math.ceil((amount || 0) / nearest) * nearest;

        const candidates = [
            totalAmount,
            50000,
            100000,
            200000,
            500000,
            roundUpToNearest(totalAmount, 5000),
            roundUpToNearest(totalAmount, 10000),
            roundUpToNearest(totalAmount, 50000),
        ];

        return [
            ...new Set(
                candidates.filter(
                    (amount) => amount >= totalAmount && amount > 0,
                ),
            ),
        ]
            .sort((a, b) => a - b)
            .slice(0, 6);
    }, [totalAmount]);

    const processPayment = useCallback(() => {
        if (!hasOpenSession) {
            notifyWarning('Buka kasir terlebih dahulu.', 'Sesi kasir tidak aktif');
            return;
        }

        const finalPaid =
            paymentMethod === 'cash' ? Number(cashReceived || 0) : totalAmount;

        if (paymentMethod === 'cash' && finalPaid < totalAmount) {
            notifyWarning('Uang pembayaran kurang.', 'Pembayaran belum cukup');
            return;
        }

        setIsProcessing(true);

        const finalChange =
            paymentMethod === 'cash' ? finalPaid - totalAmount : 0;

        router.post(
            route('transactions.store'),
            {
                draft_id: draft.id,
                cart: draft.items.map((item) => ({
                    id: item.product_id,
                    qty: item.quantity,
                })),
                payment_method: paymentMethod,
                amount_paid: finalPaid,
                change_amount: finalChange,
                customer_type: draft.customer_type,
            },
            {
                onSuccess: () => {
                    router.visit(route('transactions.create'));
                },
                onError: (errors: Record<string, string>) => {
                    const message =
                        errors?.cart ||
                        errors?.payment_method ||
                        errors?.amount_paid ||
                        'Gagal memproses transaksi.';
                    notifyError(message);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    }, [
        cashReceived,
        draft,
        hasOpenSession,
        paymentMethod,
        totalAmount,
    ]);

    const formatSignedCurrency = (value: number) =>
        `${value < 0 ? '-' : ''}Rp ${formatRupiah(Math.abs(value || 0))}`;

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Head title={`Checkout ${draft.invoice_number} - Graha Motor`} />
            <AppNotifications flash={flash} />

            <div className="mx-auto min-h-screen max-w-[1400px] px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[1fr_440px] lg:gap-6 lg:px-8 xl:grid-cols-[1fr_480px]">
                {/* Left Column: Order Summary */}
                <section className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href={route('transactions.create')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Transaksi
                        </Link>
                        <div className="text-sm font-bold text-slate-500">
                            {draft.invoice_number}
                        </div>
                    </div>

                    {/* Order Summary Card */}
                    <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                    Ringkasan Pesanan
                                </div>
                                <div className="mt-2 text-2xl font-bold text-slate-950">
                                    {draft.items.length} item
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'rounded-2xl px-4 py-2 text-sm font-bold',
                                    draft.customer_type === 'workshop'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-slate-100 text-slate-600',
                                )}
                            >
                                {draft.customer_type === 'workshop'
                                    ? 'Bengkel'
                                    : 'Umum'}
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="mt-5 space-y-3">
                            {draft.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="line-clamp-2 text-sm font-bold text-slate-900">
                                                {item.product_name}
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-slate-500">
                                                {item.quantity} x Rp{' '}
                                                {formatRupiah(item.price_at_time)}
                                            </div>
                                        </div>
                                        <div className="text-base font-bold text-slate-950 whitespace-nowrap">
                                            Rp {formatRupiah(item.subtotal)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                            <div className="text-sm font-semibold text-slate-400">
                                Total Tagihan
                            </div>
                            <div className="mt-2 text-3xl font-bold">
                                Rp {formatRupiah(totalAmount)}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Column: Payment */}
                <section className="space-y-5 lg:sticky lg:top-5">
                    <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
                        <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                            Pembayaran
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() =>
                                            setPaymentMethod(method.id)
                                        }
                                        className={cn(
                                            'flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                            paymentMethod === method.id
                                                ? 'border-slate-950 bg-slate-950 text-white'
                                                : 'border-slate-200 bg-white text-slate-600',
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {method.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Cash Payment UI */}
                        {paymentMethod === 'cash' && (
                            <div className="mt-5">
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
                                            setCashReceived(
                                                sanitizeNumericInput(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="0"
                                        className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                                    />
                                </div>

                                {/* Quick Buttons */}
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {cashShortcutAmounts.map(
                                        (amount, index) => (
                                            <button
                                                key={`${amount}-${index}`}
                                                type="button"
                                                onClick={() =>
                                                    setCashReceived(
                                                        String(amount),
                                                    )
                                                }
                                                className={cn(
                                                    'rounded-2xl border px-3 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                                    Number(
                                                        cashReceived || 0,
                                                    ) === amount
                                                        ? 'border-slate-950 bg-slate-950 text-white'
                                                        : amount ===
                                                            totalAmount
                                                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                                                )}
                                            >
                                                {amount === totalAmount
                                                    ? 'Uang Pas'
                                                    : `Rp ${formatRupiah(amount)}`}
                                            </button>
                                        ),
                                    )}
                                </div>

                                {/* Change Display */}
                                <div
                                    className={cn(
                                        'mt-3 rounded-2xl p-4 text-sm font-bold',
                                        change < 0
                                            ? 'bg-red-50 text-red-600'
                                            : 'bg-emerald-50 text-emerald-600',
                                    )}
                                >
                                    {change < 0
                                        ? `Kurang ${formatSignedCurrency(change)}`
                                        : `Kembali Rp ${formatRupiah(change)}`}
                                </div>
                            </div>
                        )}

                        {/* QRIS / Transfer Placeholder */}
                        {paymentMethod !== 'cash' && (
                            <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-center">
                                <div className="text-sm font-semibold text-slate-600">
                                    Pembayaran non-tunai akan dianggap lunas
                                    sesuai nominal total.
                                </div>
                                <div className="mt-2 text-xs font-bold text-slate-400">
                                    Konfirmasi manual oleh kasir setelah
                                    pembayaran diterima.
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={processPayment}
                                disabled={
                                    !hasOpenSession ||
                                    isProcessing ||
                                    (paymentMethod === 'cash' &&
                                        change < 0)
                                }
                                className="w-full rounded-3xl bg-slate-950 px-4 py-4 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isProcessing
                                    ? 'Memproses...'
                                    : 'Bayar Sekarang'}
                            </button>

                            <Link
                                href={route('transactions.create')}
                                className="block w-full rounded-3xl border border-slate-200 px-4 py-4 text-center text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                            >
                                Kembali ke Transaksi
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
