import {
    AppNotifications,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useMemo, useState } from 'react';
import type { SharedData } from '@/types';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';

interface CashierSession {
    id?: number;
    opened_at?: string;
}

interface Summary {
    total_transactions: number;
    revenue_total: number;
    profit_total: number;
    cash_total: number;
    non_cash_total: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    items_count: number;
    customer_type: string;
    total_amount: number;
    payment_method: string;
}

interface TopProduct {
    product_name: string;
    image_url?: string;
    quantity: number;
    revenue: number;
}

const placeholderImage = '/images/product-placeholder.svg';

export default function CashierRecap({
    cashierSession,
    summary,
    transactions,
    topProducts,
}: {
    cashierSession: CashierSession | null;
    summary: Summary;
    transactions: Transaction[];
    topProducts: TopProduct[];
}) {
    const { auth, flash } = usePage<SharedData>().props;
    const hasOpenSession = Boolean(cashierSession?.id);
    const [period, setPeriod] = useState('today');

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions.filter((t) => {
            if (period === 'all') return true;
            const date = new Date(t.created_at);
            if (period === 'today') return date >= startOfDay;
            if (period === 'week') return date >= startOfWeek;
            if (period === 'month') return date >= startOfMonth;
            return true;
        });
    }, [transactions, period]);

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title="Rekap Penjualan - Graha Motor" />
            <AppNotifications flash={flash} />

            <TopBar
                search=""
                onSearchChange={() => {}}
                hasOpenSession={hasOpenSession}
                userName={auth?.user?.name || ''}
                onSettlementClick={() =>
                    router.visit(route('transactions.create'))
                }
            />

            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Header */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                Rekap Penjualan
                            </div>
                            <div className="mt-2 text-2xl font-bold text-slate-950">
                                Ringkasan transaksi kasir
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-950"
                            >
                                <option value="today">Hari Ini</option>
                                <option value="week">Minggu Ini</option>
                                <option value="month">Bulan Ini</option>
                                <option value="all">Semua</option>
                            </select>
                            <button
                                onClick={() =>
                                    router.visit(
                                        route('transactions.create'),
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-50"
                            >
                                Kembali ke Kasir
                            </button>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={(event) => {
                                    if (hasOpenSession) {
                                        event.preventDefault();
                                        notifyWarning(
                                            'Kasir masih terbuka. Selesaikan settlement / tutup kasir terlebih dahulu sebelum logout.',
                                            'Logout diblokir',
                                        );
                                        router.visit(
                                            route('transactions.create'),
                                        );
                                        return;
                                    }
                                }}
                                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Total Transaksi
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            {summary.total_transactions}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Total Penjualan
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Rp {formatRupiah(summary.revenue_total)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Profit
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Rp {formatRupiah(summary.profit_total)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Tunai
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Rp {formatRupiah(summary.cash_total)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-indigo-600 p-4 text-white">
                        <div className="text-[11px] font-bold tracking-widest text-indigo-200 uppercase">
                            Non Tunai
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            Rp {formatRupiah(summary.non_cash_total)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    {/* Transactions */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="text-lg font-bold text-slate-950">
                            Transaksi Terbaru
                        </div>
                        <div className="mt-4 space-y-2">
                            {filteredTransactions.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-500">
                                    Belum ada transaksi untuk direkap.
                                </div>
                            )}

                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="rounded-lg border border-slate-200 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-950">
                                                {transaction.invoice_number}
                                            </div>
                                            <div className="mt-0.5 text-xs text-slate-500">
                                                {formatDateTime(
                                                    transaction.created_at,
                                                )}{' '}
                                                · {transaction.items_count}{' '}
                                                item ·{' '}
                                                {transaction.customer_type ===
                                                'workshop'
                                                    ? 'Bengkel'
                                                    : 'Umum'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-950">
                                                Rp{' '}
                                                {formatRupiah(
                                                    transaction.total_amount,
                                                )}
                                            </div>
                                            <div className="mt-0.5 text-[10px] font-bold uppercase text-slate-400">
                                                {transaction.payment_method}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="text-lg font-bold text-slate-950">
                            Produk Paling Laku
                        </div>
                        <div className="mt-4 space-y-2">
                            {topProducts.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-500">
                                    Belum ada data produk laku.
                                </div>
                            )}

                            {topProducts.map((product, index) => (
                                <div
                                    key={`${product.product_name}-${index}`}
                                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                                >
                                    <img
                                        src={
                                            product.image_url ||
                                            placeholderImage
                                        }
                                        alt={product.product_name}
                                        className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-950 line-clamp-1">
                                            {product.product_name}
                                        </div>
                                        <div className="mt-0.5 text-xs text-slate-500">
                                            {product.quantity} item terjual
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-950">
                                        Rp {formatRupiah(product.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
