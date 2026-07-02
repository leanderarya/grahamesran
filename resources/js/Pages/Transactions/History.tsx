import { AppNotifications, notifyError, notifySuccess } from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Ban } from 'lucide-react';
import type { SharedData } from '@/types';
import { formatRupiah, formatTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import { VoidModal } from '@/Components/pos/void-modal';

interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    items_count: number;
    customer_type: string;
    total_amount: number;
    payment_method: string;
    status: string;
    void_reason?: string;
    voided_at?: string;
    user?: { name: string };
}

interface PaginatedData {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function SalesHistory({ transactions }: { transactions: PaginatedData }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [apiData, setApiData] = useState<PaginatedData | null>(null);
    const [search, setSearch] = useState('');
    const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);
    const [isVoiding, setIsVoiding] = useState(false);

    useEffect(() => {
        if (!isNative()) return;
        apiClient.get('/history').then((data) => {
            setApiData({
                data: data.transactions,
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
            });
        }).catch(console.error);
    }, []);

    const activeTransactions = isNative() ? apiData : transactions;
    const hasOpenSession = true; // History accessible anytime

    const filtered = useMemo(() => {
        const items = activeTransactions?.data ?? [];
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((t) =>
            t.invoice_number.toLowerCase().includes(q) ||
            (t.user?.name ?? '').toLowerCase().includes(q)
        );
    }, [activeTransactions, search]);

    const handleVoid = async (pin: string, reason: string) => {
        if (!voidTarget) return;
        setIsVoiding(true);

        if (isNative()) {
            try {
                await apiClient.post(`/transactions/${voidTarget.id}/void`, { pin, reason });
                setApiData((prev) => prev ? {
                    ...prev,
                    data: prev.data.map((t) => t.id === voidTarget.id ? { ...t, status: 'voided', void_reason: reason, voided_at: new Date().toISOString() } : t),
                } : prev);
                setVoidTarget(null);
            } catch (error: any) {
                notifyError(error?.message || 'Gagal membatalkan transaksi.');
            } finally {
                setIsVoiding(false);
            }
        } else {
            router.post(route('transactions.void', voidTarget.id), { pin, reason }, {
                onSuccess: () => setVoidTarget(null),
                onError: (errors) => notifyError(errors?.pin || errors?.transaction || 'Gagal membatalkan.'),
                onFinish: () => setIsVoiding(false),
            });
        }
    };

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title="Riwayat Penjualan - Graha Motor" />
            <AppNotifications flash={flash} />

            <TopBar
                search=""
                onSearchChange={() => {}}
                hasOpenSession={hasOpenSession}
                userName={auth?.user?.name || ''}
                onSettlementClick={() => router.visit(route('transactions.create'))}
            />

            <main className="flex-1 overflow-y-auto p-3 lg:p-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('transactions.create')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <span className="text-base font-bold text-slate-950">Riwayat</span>
                        <span className="text-xs text-slate-400">{activeTransactions?.total ?? 0} transaksi</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari invoice..."
                            className="w-32 border-0 bg-transparent p-0 text-xs text-slate-950 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Transaction List */}
                <div className="mt-3 space-y-1">
                    {filtered.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs font-semibold text-slate-400">
                            Tidak ada transaksi ditemukan.
                        </div>
                    )}

                    {filtered.map((tx) => (
                        <div
                            key={tx.id}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                                tx.status === 'voided'
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                            <Link href={route('transactions.show', tx.id)} className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-950">{tx.invoice_number}</span>
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                        {tx.payment_method}
                                    </span>
                                    {tx.status === 'voided' && (
                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
                                            Void
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                    {formatTime(tx.created_at)} · {tx.items_count} item
                                    {tx.status === 'voided' && tx.void_reason && (
                                        <span className="text-red-400"> · {tx.void_reason}</span>
                                    )}
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${tx.status === 'voided' ? 'text-red-400 line-through' : 'text-slate-950'}`}>
                                    Rp {formatRupiah(tx.total_amount)}
                                </span>
                                {tx.status === 'paid' && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); setVoidTarget(tx); }}
                                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                        title="Batalkan transaksi"
                                    >
                                        <Ban className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <VoidModal
                show={!!voidTarget}
                onClose={() => setVoidTarget(null)}
                onConfirm={handleVoid}
                isProcessing={isVoiding}
                invoiceNumber={voidTarget?.invoice_number ?? ''}
            />
        </div>
    );
}
