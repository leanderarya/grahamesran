import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { X } from 'lucide-react';

const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');

const formatSignedCurrency = (value: number) =>
    `${value < 0 ? '-' : ''}Rp ${formatRupiah(Math.abs(value || 0))}`;

interface CashierSession {
    id?: number;
    opening_cash?: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    transactions_count?: number;
    opened_at?: string;
}

interface SettlementModalProps {
    show: boolean;
    onClose: () => void;
    sessionState: CashierSession | null;
    closingCash: string;
    closingNotes: string;
    onClosingCashChange: (value: string) => void;
    onClosingNotesChange: (value: string) => void;
    onSubmit: () => void;
    isClosingSession: boolean;
    expectedCash: number;
    settlementDifference: number;
    settlementStatus: 'balance' | 'minus' | 'over';
}

export function SettlementModal({
    show,
    onClose,
    sessionState,
    closingCash,
    closingNotes,
    onClosingCashChange,
    onClosingNotesChange,
    onSubmit,
    isClosingSession,
    expectedCash,
    settlementDifference,
    settlementStatus,
}: SettlementModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Settlement
                        </div>
                        <div className="mt-1 text-xl font-bold text-slate-950">
                            Tutup kasir dan cocokkan uang fisik
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 2x2 Stat Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Saldo Awal
                        </div>
                        <div className="mt-1.5 text-lg font-bold text-slate-950">
                            Rp {formatRupiah(sessionState?.opening_cash || 0)}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Cash Sales
                        </div>
                        <div className="mt-1.5 text-lg font-bold text-slate-950">
                            Rp {formatRupiah(sessionState?.cash_sales_total || 0)}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Non Cash
                        </div>
                        <div className="mt-1.5 text-lg font-bold text-slate-950">
                            Rp {formatRupiah(sessionState?.non_cash_sales_total || 0)}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3.5 text-white">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Expected Cash
                        </div>
                        <div className="mt-1.5 text-lg font-bold">
                            Rp {formatRupiah(expectedCash)}
                        </div>
                    </div>
                </div>

                {/* Input Section */}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Uang Fisik Di Laci
                        </label>
                        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                            <span className="text-sm font-bold text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={closingCash}
                                onChange={(event) =>
                                    onClosingCashChange(
                                        sanitizeNumericInput(event.target.value),
                                    )
                                }
                                placeholder="0"
                                className="w-full border-0 bg-transparent p-0 text-xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                            />
                        </div>

                        <label className="mt-3 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Catatan
                        </label>
                        <textarea
                            rows={2}
                            value={closingNotes}
                            onChange={(event) =>
                                onClosingNotesChange(event.target.value)
                            }
                            placeholder="Opsional"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-0 focus:outline-none"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Hasil
                        </div>
                        <div
                            className={cn(
                                'mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold uppercase',
                                settlementStatus === 'balance'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : settlementStatus === 'minus'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700',
                            )}
                        >
                            {settlementStatus === 'balance'
                                ? 'Balance'
                                : settlementStatus === 'minus'
                                  ? 'Minus'
                                  : 'Lebih'}
                        </div>
                        <div
                            className={cn(
                                'mt-3 text-2xl font-bold',
                                settlementStatus === 'balance'
                                    ? 'text-emerald-700'
                                    : settlementStatus === 'minus'
                                      ? 'text-red-700'
                                      : 'text-amber-700',
                            )}
                        >
                            {formatSignedCurrency(settlementDifference)}
                        </div>
                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                            <div className="flex justify-between">
                                <span>Expected</span>
                                <span className="font-bold text-slate-900">
                                    Rp {formatRupiah(expectedCash)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fisik</span>
                                <span className="font-bold text-slate-900">
                                    Rp {formatRupiah(Number(closingCash || 0))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Transaksi</span>
                                <span className="font-bold text-slate-900">
                                    {sessionState?.transactions_count || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isClosingSession}
                        className="flex-[1.2] rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                    >
                        {isClosingSession ? 'Menyimpan...' : 'Simpan & Tutup Kasir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
