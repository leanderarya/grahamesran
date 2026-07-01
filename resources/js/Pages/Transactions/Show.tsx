import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title={`${transaction.invoice_number} - Graha Motor`} />

            <TopBar
                search=""
                onSearchChange={() => {}}
                hasOpenSession={false}
                userName={auth?.user?.name || ''}
                onSettlementClick={() => {}}
            />

            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Header */}
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
                            {transaction.invoice_number}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Tanggal
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-950">
                            {formatDateTime(transaction.created_at)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Pelanggan
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-950">
                            {transaction.customer_type === 'workshop' ? 'Bengkel' : 'Umum'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Pembayaran
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-950 uppercase">
                            {transaction.payment_method}
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mt-4 rounded-xl border border-slate-200 p-5">
                    <div className="text-lg font-bold text-slate-950">
                        Item
                    </div>
                    <div className="mt-3 space-y-2">
                        {transaction.items.map((item) => (
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
                                Rp {formatRupiah(transaction.total_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Bayar</span>
                            <span className="font-bold text-slate-950">
                                Rp {formatRupiah(transaction.amount_paid)}
                            </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2">
                            <div className="flex justify-between text-sm font-bold text-slate-950">
                                <span>Kembali</span>
                                <span>Rp {formatRupiah(transaction.change_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
