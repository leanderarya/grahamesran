import { formatRupiah } from '@/lib/format';
import { Printer, X } from 'lucide-react';
import { usePrintClosing } from '@/hooks/usePrintClosing';
import type { ClosingReportData } from '@/lib/printer';

interface ClosingReportProps {
    show: boolean;
    onClose: () => void;
    data: ClosingReportData | null;
}

export function ClosingReport({ show, onClose, data }: ClosingReportProps) {
    const { print, isPrinting, printError } = usePrintClosing();

    if (!show || !data) return null;

    const handlePrint = () => {
        print(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-950">Closing Report</span>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Report Preview */}
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-center font-bold">GRAHA MOTOR</div>
                    <div className="text-center text-[10px] text-slate-500">Jl. Raya Pertamina No. 1</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div className="text-center font-bold">LAPORAN CLOSING KASIR</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div>Tanggal: {data.date}</div>
                    <div>Kasir: {data.cashierName}</div>
                    <div>Buka: {data.openedAt} → Tutup: {data.closedAt}</div>
                    <div>Durasi: {data.duration}</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div className="font-bold">RINGKASAN</div>
                    <div>Transaksi: {data.totalTransactions}</div>
                    <div>Revenue: Rp {formatRupiah(data.totalRevenue)}</div>
                    <div>Profit: Rp {formatRupiah(data.totalProfit)}</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div className="font-bold">SETTLEMENT</div>
                    <div>Saldo Awal: Rp {formatRupiah(data.openingCash)}</div>
                    <div>Expected: Rp {formatRupiah(data.expectedCash)}</div>
                    <div>Fisik: Rp {formatRupiah(data.physicalCash)}</div>
                    <div className="font-bold">Selisih: Rp {formatRupiah(data.difference)} ({data.settlementStatus})</div>
                </div>

                {printError && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                        {printError}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        {isPrinting ? 'Mencetak...' : 'Cetak'}
                    </button>
                </div>
            </div>
        </div>
    );
}
