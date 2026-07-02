import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import type { TransactionDetail } from '@/types/pos';
import { formatRupiah, formatTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import { usePrintReceipt } from '@/hooks/usePrintReceipt';

export default function TransactionShow({ transaction }: { transaction: TransactionDetail }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [apiTransaction, setApiTransaction] = useState<TransactionDetail | null>(null);
    const { print: printReceipt, isPrinting, printError } = usePrintReceipt();

    useEffect(() => {
        if (!isNative()) return;

        const pathParts = window.location.pathname.split('/');
        const transactionId = pathParts[pathParts.length - 1];

        apiClient
            .get(`/transactions/${transactionId}`)
            .then((data) => {
                setApiTransaction(data.transaction);
            })
            .catch((err) => {
                console.error('Failed to load transaction:', err);
            });
    }, []);

    const activeTx = isNative() ? apiTransaction : transaction;

    const handlePrint = () => {
        if (!activeTx) return;
        printReceipt({
            invoice: activeTx.invoice_number,
            date: new Date(activeTx.created_at).toLocaleDateString('id-ID'),
            items: activeTx.items.map((item) => ({
                name: item.product_name,
                sell_price: item.price_at_time,
                qty: item.quantity,
            })),
            total: activeTx.total_amount,
            payAmount: activeTx.amount_paid,
            change: activeTx.change_amount,
            paymentMethod: activeTx.payment_method,
            customerType: activeTx.customer_type,
        });
    };

    if (!activeTx) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-sm text-slate-500">Memuat transaksi...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title={`${activeTx.invoice_number} - Graha Motor`} />

            <TopBar
                search=""
                onSearchChange={() => {}}
                hasOpenSession={false}
                userName={auth?.user?.name || ''}
                onSettlementClick={() => {}}
            />

            <main className="flex-1 overflow-y-auto p-3 lg:p-4">
                {/* Header — compact single row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('transactions.recap')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-950">{activeTx.invoice_number}</span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                {activeTx.payment_method}
                            </span>
                            {activeTx.customer_type === 'workshop' && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Bengkel</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        {isPrinting ? 'Mencetak...' : 'Cetak'}
                    </button>
                </div>

                {printError && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                        {printError}
                    </div>
                )}

                {/* Info bar — single compact row */}
                <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{formatTime(activeTx.created_at)}</span>
                    <span className="text-slate-300">·</span>
                    <span>{activeTx.cashier_name ? `Kasir: ${activeTx.cashier_name}` : ''}</span>
                    <span className="text-slate-300">·</span>
                    <span>{activeTx.items.length} item</span>
                </div>

                {/* Items — compact list */}
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-xs font-bold text-slate-950">Item</div>
                    <div className="mt-1.5 space-y-0.5">
                        {activeTx.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-slate-50"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-slate-950 line-clamp-1">{item.product_name}</div>
                                    <div className="text-[10px] text-slate-400">
                                        {item.quantity} x Rp {formatRupiah(item.price_at_time)}
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-slate-950">
                                    Rp {formatRupiah(item.subtotal)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total — compact */}
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Total</span>
                            <span className="font-bold text-slate-950">Rp {formatRupiah(activeTx.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Bayar</span>
                            <span className="font-bold text-slate-950">Rp {formatRupiah(activeTx.amount_paid)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1">
                            <div className="flex justify-between font-bold text-slate-950">
                                <span>Kembali</span>
                                <span>Rp {formatRupiah(activeTx.change_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
