import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface LogoutModalProps {
    show: boolean;
    onClose: () => void;
}

export function LogoutModal({ show, onClose }: LogoutModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
                <div className="text-xl font-bold text-slate-950">
                    Keluar dari kasir?
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-500">
                    Gunakan logout hanya jika tidak ada sesi kasir yang sedang
                    aktif.
                </div>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-3xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                    >
                        Batal
                    </button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 rounded-3xl bg-slate-950 py-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
                    >
                        Ya, Keluar
                    </Link>
                </div>
            </div>
        </div>
    );
}
