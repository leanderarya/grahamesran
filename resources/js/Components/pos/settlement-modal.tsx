import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { X } from 'lucide-react';

const formSurface =
    'border border-slate-200 bg-white transition-all duration-200 ease-out';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                            Settlement
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-950">
                            Tutup kasir dan cocokkan uang fisik
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-2xl bg-slate-100 p-3 text-slate-500"
                    >
                        <X />
                    </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Saldo Awal
                        </div>
                        <div className="mt-2 text-xl font-bold text-slate-950">
                            Rp{' '}
                            {formatRupiah(
                                sessionState?.opening_cash || 0,
                            )}
                        </div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Cash Sales
                        </div>
                        <div className="mt-2 text-xl font-bold text-slate-950">
                            Rp{' '}
                            {formatRupiah(
                                sessionState?.cash_sales_total || 0,
                            )}
                        </div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Non Cash
                        </div>
                        <div className="mt-2 text-xl font-bold text-slate-950">
                            Rp{' '}
                            {formatRupiah(
                                sessionState?.non_cash_sales_total || 0,
                            )}
                        </div>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-4 text-white">
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Expected Cash
                        </div>
                        <div className="mt-2 text-xl font-bold">
                            Rp {formatRupiah(expectedCash)}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl bg-slate-50 p-5">
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Uang Fisik Di Laci
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
                                value={closingCash}
                                onChange={(event) =>
                                    onClosingCashChange(
                                        sanitizeNumericInput(
                                            event.target.value,
                                        ),
                                    )
                                }
                                placeholder="0"
                                className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                            />
                        </div>

                        <label className="mt-4 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Catatan Settlement
                        </label>
                        <textarea
                            rows={4}
                            value={closingNotes}
                            onChange={(event) =>
                                onClosingNotesChange(event.target.value)
                            }
                            placeholder="Opsional"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-0 focus:outline-none"
                        />
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5">
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Hasil Settlement
                        </div>
                        <div
                            className={cn(
                                'mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase',
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
                                'mt-4 text-3xl font-bold',
                                settlementStatus === 'balance'
                                    ? 'text-emerald-700'
                                    : settlementStatus === 'minus'
                                      ? 'text-red-700'
                                      : 'text-amber-700',
                            )}
                        >
                            {formatSignedCurrency(settlementDifference)}
                        </div>

                        <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
                            <div className="flex items-center justify-between">
                                <span>Expected cash</span>
                                <span className="font-bold text-slate-950">
                                    Rp {formatRupiah(expectedCash)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Uang fisik</span>
                                <span className="font-bold text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        Number(
                                            closingCash || 0,
                                        ),
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Total transaksi</span>
                                <span className="font-bold text-slate-950">
                                    {sessionState?.transactions_count ||
                                        0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-3xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isClosingSession}
                        className="flex-[1.2] rounded-3xl bg-slate-950 py-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:opacity-40"
                    >
                        {isClosingSession
                            ? 'Menyimpan...'
                            : 'Simpan Settlement & Tutup Kasir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
