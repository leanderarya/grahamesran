import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { sanitizeNumericInput } from '@/lib/format';

interface OpenSessionModalProps {
    show: boolean;
    onClose: () => void;
    openingCash: string;
    openingNotes: string;
    onOpeningCashChange: (value: string) => void;
    onOpeningNotesChange: (value: string) => void;
    onSubmit: () => void;
    isOpeningSession: boolean;
}

export function OpenSessionModal(props: OpenSessionModalProps) {
    const {
        show,
        openingCash,
        openingNotes,
        onOpeningCashChange,
        onOpeningNotesChange,
        onSubmit,
        isOpeningSession,
    } = props;
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Buka Kasir
                </div>
                <div className="mt-2 text-xl font-bold text-slate-950">
                    Masukkan uang awal di laci
                </div>
                <div className="mt-1 text-sm text-slate-500">
                    Nilai ini akan menjadi dasar expected cash saat settlement.
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Cash Awal
                        </label>
                        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                            <span className="text-sm font-bold text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={openingCash}
                                onChange={(event) =>
                                    onOpeningCashChange(
                                        sanitizeNumericInput(event.target.value),
                                    )
                                }
                                placeholder="0"
                                className="w-full border-0 bg-transparent p-0 text-xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Catatan (opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={openingNotes}
                            onChange={(event) =>
                                onOpeningNotesChange(event.target.value)
                            }
                            placeholder="Opsional"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-5 flex gap-3">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Keluar
                    </Link>
                    <button
                        onClick={onSubmit}
                        disabled={isOpeningSession}
                        className="flex-[1.2] rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                    >
                        {isOpeningSession ? 'Membuka...' : 'Buka Kasir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
