import { useState, useCallback } from 'react';
import { generateClosingEscPos, printReceipt } from '@/lib/printer';
import type { ClosingReportData, StoreInfo } from '@/lib/printer';
import { isNative } from '@/lib/capacitor';

const STORE_CONFIG: StoreInfo = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

export function usePrintClosing() {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printError, setPrintError] = useState<string | null>(null);

    const print = useCallback(async (data: ClosingReportData) => {
        setIsPrinting(true);
        setPrintError(null);

        try {
            if (!isNative()) {
                // Web fallback: show as printable HTML
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <html><head><title>Closing Report</title>
                        <style>body{font-family:monospace;font-size:12px;padding:20px;max-width:300px;margin:0 auto}
                        h2,h3{text-align:center;margin:4px 0}hr{border:none;border-top:1px dashed #000;margin:8px 0}
                        .row{display:flex;justify-content:space-between}</style></head><body>
                        <h2>${STORE_CONFIG.name}</h2><p style="text-align:center">${STORE_CONFIG.address}<br>${STORE_CONFIG.phone}</p><hr>
                        <h3>LAPORAN CLOSING KASIR</h3><hr>
                        <p>Tanggal: ${data.date}<br>Kasir: ${data.cashierName}<br>Buka: ${data.openedAt} → Tutup: ${data.closedAt}<br>Durasi: ${data.duration}</p><hr>
                        <p><strong>RINGKASAN</strong><br>Transaksi: ${data.totalTransactions}<br>Revenue: Rp ${data.totalRevenue.toLocaleString('id-ID')}<br>Profit: Rp ${data.totalProfit.toLocaleString('id-ID')}</p><hr>
                        <p><strong>SETTLEMENT</strong><br>Saldo Awal: Rp ${data.openingCash.toLocaleString('id-ID')}<br>Expected: Rp ${data.expectedCash.toLocaleString('id-ID')}<br>Fisik: Rp ${data.physicalCash.toLocaleString('id-ID')}<br>Selisih: Rp ${data.difference.toLocaleString('id-ID')} (${data.settlementStatus})</p><hr>
                        <p style="margin-top:30px">TTD Kasir: ____________<br>TTD Supervisor: ________</p>
                        </body></html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                }
                return;
            }

            // Capacitor: send to Bluetooth printer
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { listDevices: () => Promise<{ devices: Array<{ name: string; address: string }> }>; connect: (opts: { address: string }) => Promise<void>; print: (opts: { data: string }) => Promise<{ success: boolean }>; disconnect: () => Promise<void> } };
            const { BluetoothPrinter } = plugin;

            const savedAddress = localStorage.getItem('printer_address');
            if (!savedAddress) {
                throw new Error('Printer belum dikonfigurasi. Buka Pengaturan Printer.');
            }

            await BluetoothPrinter.connect({ address: savedAddress });
            const bytes = generateClosingEscPos(data, STORE_CONFIG);
            const dataStr = String.fromCharCode(...bytes);
            await BluetoothPrinter.print({ data: dataStr });
            await BluetoothPrinter.disconnect();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal mencetak closing report.';
            setPrintError(message);
        } finally {
            setIsPrinting(false);
        }
    }, []);

    return { print, isPrinting, printError };
}
