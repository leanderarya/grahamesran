import {
    AppNotifications,
} from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { SharedData } from '@/types';
import type { CashierSession, RecapSummary, TransactionListItem, TopProduct } from '@/types/pos';
import { formatRupiah, formatTime, formatDuration } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';

const placeholderImage = '/images/product-placeholder.svg';

export default function CashierRecap({
    cashierSession,
    summary,
    transactions,
    topProducts,
}: {
    cashierSession: CashierSession | null;
    summary: RecapSummary;
    transactions: TransactionListItem[];
    topProducts: TopProduct[];
}) {
    const { auth, flash } = usePage<SharedData>().props;
    const [apiData, setApiData] = useState<any>(null);

    useEffect(() => {
        if (!isNative()) return;

        apiClient
            .get('/recap')
            .then((data) => {
                setApiData(data);
            })
            .catch((err) => {
                console.error('Failed to load recap:', err);
            });
    }, []);

    const activeSession = isNative() ? apiData?.session : cashierSession;
    const activeSummary = isNative() ? apiData?.summary : summary;
    const activeTransactions = isNative() ? apiData?.transactions : transactions;
    const activeTopProducts = isNative() ? (apiData?.topProducts ?? []) : topProducts;

    const hasOpenSession = Boolean(activeSession?.id);
    const [period, setPeriod] = useState('today');

    const filteredTransactions = useMemo(() => {
        const txns: TransactionListItem[] = activeTransactions ?? [];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return txns.filter((t) => {
            if (period === 'all') return true;
            const date = new Date(t.created_at);
            if (period === 'today') return date >= startOfDay;
            if (period === 'week') return date >= startOfWeek;
            if (period === 'month') return date >= startOfMonth;
            return true;
        });
    }, [activeTransactions, period]);

    const avgPerTransaction = activeSummary?.total_transactions
        ? Math.round((activeSummary.revenue_total ?? 0) / activeSummary.total_transactions)
        : 0;

    const sessionStatus = hasOpenSession ? 'Aktif' : 'Tutup';

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

            <main className="flex-1 overflow-y-auto p-3 lg:p-4">
                {/* Header — compact single row */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('transactions.create')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-950">Rekap</span>
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${hasOpenSession ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {sessionStatus}
                            </span>
                            {activeSession?.opened_at && (
                                <span className="text-xs text-slate-400">
                                    {formatTime(activeSession.opened_at)} · {formatDuration(activeSession.opened_at)}
                                </span>
                            )}
                        </div>
                    </div>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-950"
                    >
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="all">Semua</option>
                    </select>
                </div>

                {/* Stat Cards — compact grid */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Transaksi</div>
                        <div className="mt-1 text-lg font-bold leading-tight text-slate-950">
                            {activeSummary?.total_transactions ?? 0}
                        </div>
                        {avgPerTransaction > 0 && (
                            <div className="mt-0.5 text-[10px] text-slate-400">~Rp {formatRupiah(avgPerTransaction)}/trx</div>
                        )}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Revenue</div>
                        <div className="mt-1 text-lg font-bold leading-tight text-slate-950">
                            Rp {formatRupiah(activeSummary?.revenue_total ?? 0)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Profit</div>
                        <div className="mt-1 text-lg font-bold leading-tight text-emerald-600">
                            Rp {formatRupiah(activeSummary?.profit_total ?? 0)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Tunai</div>
                        <div className="mt-1 text-lg font-bold leading-tight text-slate-950">
                            Rp {formatRupiah(activeSummary?.cash_total ?? 0)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-indigo-600 p-2.5 text-white">
                        <div className="text-[10px] font-bold tracking-wider text-indigo-200 uppercase">Non Tunai</div>
                        <div className="mt-1 text-lg font-bold leading-tight">
                            Rp {formatRupiah(activeSummary?.non_cash_total ?? 0)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-3 grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
                    {/* Transactions */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="text-sm font-bold text-slate-950">Transaksi Terbaru</div>
                        <div className="mt-2 space-y-1">
                            {filteredTransactions.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs font-semibold text-slate-400">
                                    Belum ada transaksi.
                                </div>
                            )}

                            {filteredTransactions.map((transaction) => (
                                <Link
                                    key={transaction.id}
                                    href={route('transactions.show', transaction.id)}
                                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 transition-colors hover:bg-slate-50 active:bg-slate-100"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-950">{transaction.invoice_number}</span>
                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                                {transaction.payment_method}
                                            </span>
                                            {transaction.customer_type === 'workshop' && (
                                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Bengkel</span>
                                            )}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-slate-400">
                                            {formatTime(transaction.created_at)} · {transaction.items_count} item
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-950">
                                        Rp {formatRupiah(transaction.total_amount)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="text-sm font-bold text-slate-950">Produk Paling Laku</div>
                        <div className="mt-2 space-y-1">
                            {activeTopProducts.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs font-semibold text-slate-400">
                                    Belum ada data produk.
                                </div>
                            )}

                            {activeTopProducts.map((product: TopProduct, index: number) => (
                                <div
                                    key={`${product.product_name}-${index}`}
                                    className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2"
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                                        {index + 1}
                                    </span>
                                    <img
                                        src={product.image_url || placeholderImage}
                                        alt={product.product_name}
                                        className="h-8 w-8 rounded border border-slate-200 bg-white object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold text-slate-950 line-clamp-1">
                                            {product.product_name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">{product.quantity}x terjual</div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-950">
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
