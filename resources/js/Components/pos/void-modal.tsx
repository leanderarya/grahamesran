import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface VoidModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isProcessing: boolean;
    invoiceNumber: string;
}

export function VoidModal({
    show,
    onClose,
    onConfirm,
    isProcessing,
    invoiceNumber,
}: VoidModalProps) {
    const [reason, setReason] = useState('');

    if (!show) return null;

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onConfirm(reason.trim());
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-bold text-slate-950">Batalkan Transaksi</span>
                    </div>
                    <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                    Transaksi <span className="font-bold text-slate-700">{invoiceNumber}</span> akan dibatalkan. Stok produk akan dikembalikan.
                </p>

                {/* Reason Input */}
                <div className="mt-3">
                    <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Alasan Pembatalan</label>
                    <textarea
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Wajib diisi..."
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-red-300 focus:ring-0 focus:outline-none"
                    />
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason.trim() || isProcessing}
                        className="flex-1 rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isProcessing ? 'Membatalkan...' : 'Batalkan Transaksi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
