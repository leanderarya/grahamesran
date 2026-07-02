import { useState, useCallback } from 'react';
import { printReceipt } from '@/lib/printer';
import type { ReceiptData, StoreInfo } from '@/lib/printer';
import { STORE_CONFIG } from '@/config/store';

/**
 * React hook for printing receipts.
 * On web: triggers window.print() via the hidden PrintReceipt component.
 * On Capacitor: sends ESC/POS data to a paired Bluetooth thermal printer.
 */
export function usePrintReceipt() {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printError, setPrintError] = useState<string | null>(null);

    const print = useCallback(async (data: ReceiptData) => {
        setIsPrinting(true);
        setPrintError(null);

        try {
            await printReceipt(data, STORE_CONFIG);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Gagal mencetak.';
            setPrintError(message);
        } finally {
            setIsPrinting(false);
        }
    }, []);

    return { print, isPrinting, printError };
}
