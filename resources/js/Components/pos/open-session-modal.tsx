import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const formSurface =
    'border border-slate-200 bg-white transition-all duration-200 ease-out';

const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                    Buka Kasir
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-950">
                    Masukkan uang awal di laci
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-500">
                    Nilai ini akan menjadi dasar expected cash saat
                    settlement nanti.
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        Cash Awal
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
                            value={openingCash}
                            onChange={(event) =>
                                onOpeningCashChange(
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
                        Catatan Awal
                    </label>

                    <textarea
                        rows={3}
                        value={openingNotes}
                        onChange={(event) =>
                            onOpeningNotesChange(event.target.value)
                        }
                        placeholder="Opsional"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-0 focus:outline-none"
                    />
                </div>

                <div className="mt-6 flex gap-3">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 rounded-3xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                    >
                        Keluar
                    </Link>
                    <button
                        onClick={onSubmit}
                        disabled={isOpeningSession}
                        className="flex-[1.2] rounded-3xl bg-slate-950 py-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:opacity-40"
                    >
                        {isOpeningSession ? 'Membuka...' : 'Buka Kasir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
