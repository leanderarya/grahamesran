import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import { usePrintReceipt } from '@/hooks/usePrintReceipt';

interface TransactionItem {
    id: number;
    product_name: string;
    quantity: number;
    price_at_time: number;
    subtotal: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    payment_method: string;
    customer_type: string;
    total_amount: number;
    amount_paid: number;
    change_amount: number;
    items: TransactionItem[];
}

export default function TransactionShow({ transaction }: { transaction: Transaction }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [apiTransaction, setApiTransaction] = useState<Transaction | null>(null);
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

            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('transactions.recap')}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Detail Transaksi
                            </div>
                            <div className="text-lg font-bold text-slate-950">
                                {activeTx.invoice_number}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                        <Printer className="h-4 w-4" />
                        {isPrinting ? 'Mencetak...' : 'Cetak'}
                    </button>
                </div>

                {printError && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        {printError}
                    </div>
                )}

                {/* Info */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Tanggal
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-950">
                            {formatDateTime(activeTx.created_at)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Pelanggan
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-950">
                            {activeTx.customer_type === 'workshop' ? 'Bengkel' : 'Umum'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Pembayaran
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-950 uppercase">
                            {activeTx.payment_method}
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mt-4 rounded-xl border border-slate-200 p-5">
                    <div className="text-lg font-bold text-slate-950">
                        Item
                    </div>
                    <div className="mt-3 space-y-2">
                        {activeTx.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                            >
                                <div>
                                    <div className="text-sm font-semibold text-slate-950">
                                        {item.product_name}
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-500">
                                        {item.quantity} x Rp {formatRupiah(item.price_at_time)}
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-slate-950">
                                    Rp {formatRupiah(item.subtotal)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="mt-4 rounded-xl border border-slate-200 p-5">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Total</span>
                            <span className="font-bold text-slate-950">
                                Rp {formatRupiah(activeTx.total_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Bayar</span>
                            <span className="font-bold text-slate-950">
                                Rp {formatRupiah(activeTx.amount_paid)}
                            </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2">
                            <div className="flex justify-between text-sm font-bold text-slate-950">
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
