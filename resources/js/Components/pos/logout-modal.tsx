import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface LogoutModalProps {
    show: boolean;
    onClose: () => void;
}

export function LogoutModal({ show, onClose }: LogoutModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
                <div className="text-lg font-bold text-slate-950">
                    Keluar dari kasir?
                </div>
                <div className="mt-1 text-sm text-slate-500">
                    Gunakan logout hanya jika tidak ada sesi kasir yang aktif.
                </div>
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                    >
                        Ya, Keluar
                    </Link>
                </div>
            </div>
        </div>
    );
}
