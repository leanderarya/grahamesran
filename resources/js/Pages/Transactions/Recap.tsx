import {
    AppNotifications,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { LogoutModal } from '@/Components/pos/logout-modal';

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
                <div className="rounded-xl bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                Rekap Penjualan
                            </div>
                            <div className="mt-2 text-2xl font-bold text-slate-950">
                                Ringkasan transaksi kasir
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-500">
                                Halaman ini dipisah dari layar transaksi
                                agar operasional kasir tetap fokus dan
                                laporan lebih mudah dirawat.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    router.visit(
                                        route('transactions.create'),
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
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
                                className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-lg bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Total Transaksi
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            {summary.total_transactions}
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Omzet
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Rp {formatRupiah(summary.revenue_total)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Profit
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Rp {formatRupiah(summary.profit_total)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Tunai
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Rp {formatRupiah(summary.cash_total)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-4 text-white">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Non Tunai
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            Rp {formatRupiah(summary.non_cash_total)}
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-xl bg-white p-5">
                        <div className="text-lg font-bold text-slate-950">
                            Transaksi Terbaru
                        </div>
                        <div className="mt-4 space-y-3">
                            {transactions.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                                    Belum ada transaksi untuk direkap.
                                </div>
                            )}

                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-950">
                                                {transaction.invoice_number}
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-slate-500">
                                                {formatDateTime(
                                                    transaction.created_at,
                                                )}{' '}
                                                • {transaction.items_count}{' '}
                                                item •{' '}
                                                {transaction.customer_type ===
                                                'workshop'
                                                    ? 'Bengkel'
                                                    : 'Umum'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-slate-950">
                                                Rp{' '}
                                                {formatRupiah(
                                                    transaction.total_amount,
                                                )}
                                            </div>
                                            <div className="mt-1 text-xs font-bold text-slate-400 uppercase">
                                                {transaction.payment_method}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5">
                        <div className="text-lg font-bold text-slate-950">
                            Produk Paling Laku
                        </div>
                        <div className="mt-4 space-y-3">
                            {topProducts.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                                    Belum ada data produk laku.
                                </div>
                            )}

                            {topProducts.map((product, index) => (
                                <div
                                    key={`${product.product_name}-${index}`}
                                    className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                                >
                                    <img
                                        src={
                                            product.image_url ||
                                            placeholderImage
                                        }
                                        alt={product.product_name}
                                        className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="line-clamp-2 text-sm font-bold text-slate-950">
                                            {product.product_name}
                                        </div>
                                        <div className="mt-1 text-xs font-semibold text-slate-500">
                                            {product.quantity} item terjual
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-950">
                                            Rp{' '}
                                            {formatRupiah(product.revenue)}
                                        </div>
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
