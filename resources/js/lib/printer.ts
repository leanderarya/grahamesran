import { isNative } from './capacitor';

function getPlugin() {
    return (window as any).Capacitor?.Plugins?.BluetoothThermalPrinter;
}

export interface ReceiptData {
    invoice: string;
    date: string;
    items: Array<{
        name: string;
        volume_liter?: number | string;
        sell_price: number | string;
        qty: number;
    }>;
    total: number;
    payAmount: number;
    change: number;
    paymentMethod: string;
    cashier?: string;
    customerType: string;
}

export interface StoreInfo {
    name: string;
    address: string;
    phone: string;
}

// ESC/POS commands
const ESC = 0x1b;
const LF = 0x0a;
const GS = 0x1d;

function encodeText(text: string): number[] {
    return Array.from(new TextEncoder().encode(text));
}

function centerAlign(): number[] {
    return [ESC, 0x61, 0x01];
}

function leftAlign(): number[] {
    return [ESC, 0x61, 0x00];
}

function boldOn(): number[] {
    return [ESC, 0x45, 0x01];
}

function boldOff(): number[] {
    return [ESC, 0x45, 0x00];
}

function feedLines(n: number): number[] {
    return [ESC, 0x64, n];
}

function cutPaper(): number[] {
    // Try partial cut first (more widely supported), then full cut
    return [GS, 0x56, 0x01];
}

function hr(width: number = 32): number[] {
    return encodeText('-'.repeat(width) + '\n');
}

/**
 * Convert a byte array to a string where each byte maps to a character.
 * Safe for the @candraadiw/capacitor-bluetooth-printer plugin which
 * calls `data.getBytes()` on Android — bytes 0x00–0x7F survive the
 * UTF-8 round-trip unchanged, which covers all ESC/POS commands used here.
 */
function bytesToString(bytes: number[]): string {
    return String.fromCharCode(...bytes);
}

/**
 * Generate ESC/POS byte stream for a 58mm thermal receipt.
 */
export function generateEscPos(data: ReceiptData, store: StoreInfo): number[] {
    const commands: number[] = [];

    // Header - centered and bold
    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText(store.name + '\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(store.address + '\n'));
    commands.push(...encodeText(store.phone + '\n'));
    commands.push(...leftAlign());
    commands.push(...hr());

    // Transaction info
    commands.push(...encodeText(`No: ${data.invoice}\n`));
    commands.push(...encodeText(`Tgl: ${data.date}\n`));
    commands.push(...encodeText(`Kasir: ${data.cashier || '-'}\n`));
    commands.push(...encodeText(`Plg: ${data.customerType}\n`));
    commands.push(...hr());

    // Items
    for (const item of data.items) {
        const label = item.volume_liter
            ? `${item.name} ${item.volume_liter}L`
            : item.name;
        commands.push(...boldOn());
        commands.push(...encodeText(`${label}\n`));
        commands.push(...boldOff());

        const price = Number(item.sell_price || 0).toLocaleString('id-ID');
        const subtotal = (
            Number(item.qty || 0) * Number(item.sell_price || 0)
        ).toLocaleString('id-ID');
        commands.push(
            ...encodeText(`  ${item.qty} x ${price}    ${subtotal}\n`),
        );
    }

    commands.push(...hr());

    // Total
    commands.push(...boldOn());
    commands.push(
        ...encodeText(
            `TOTAL        Rp ${data.total.toLocaleString('id-ID')}\n`,
        ),
    );
    commands.push(...boldOff());
    commands.push(
        ...encodeText(
            `Bayar (${data.paymentMethod})  Rp ${data.payAmount.toLocaleString('id-ID')}\n`,
        ),
    );
    commands.push(
        ...encodeText(
            `Kembali      Rp ${data.change.toLocaleString('id-ID')}\n`,
        ),
    );

    commands.push(...centerAlign());
    commands.push(...encodeText('*** TERIMA KASIH ***\n'));
    commands.push(
        ...encodeText('Barang yang dibeli tidak dapat ditukar/dikembalikan\n'),
    );
    commands.push(...feedLines(1));
    commands.push(...cutPaper());

    return commands;
}

/**
 * Print a receipt. On web, falls back to window.print().
 * On Capacitor (Android), sends ESC/POS data to a paired Bluetooth printer.
 */
export async function printReceipt(
    data: ReceiptData,
    store: StoreInfo,
): Promise<void> {
    if (!isNative()) {
        // Web fallback: trigger browser print dialog
        window.print();
        return;
    }

    try {
        const plugin = getPlugin();
        if (!plugin) throw new Error('Plugin Bluetooth tidak tersedia.');

        // Use saved printer address, or fall back to first paired device
        let address = localStorage.getItem('printer_address');

        if (!address) {
            const response = await plugin.listPairedDevices();
            const devices = response?.devices ?? [];
            if (devices.length === 0) {
                throw new Error(
                    'Tidak ada printer Bluetooth yang terpasang. Silakan pasangkan printer terlebih dahulu.',
                );
            }
            address = devices[0].address;
        }

        // Connect to printer
        await plugin.connect({ deviceId: address });

        // Generate ESC/POS data and send as text
        const escPosBytes = generateEscPos(data, store);
        const escPosString = bytesToString(escPosBytes);

        // Send to printer
        await plugin.printText({ text: escPosString });

        // Disconnect
        await plugin.disconnect();
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : 'Gagal mencetak struk.';
        throw new Error(message);
    }
}

export interface ClosingReportData {
    date: string;
    cashierName: string;
    openedAt: string;
    closedAt: string;
    duration: string;
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    cashTotal: number;
    nonCashTotal: number;
    openingCash: number;
    cashSales: number;
    expectedCash: number;
    physicalCash: number;
    difference: number;
    settlementStatus: 'balance' | 'minus' | 'over';
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

export function generateClosingEscPos(data: ClosingReportData, store: StoreInfo): number[] {
    const commands: number[] = [];

    // Header
    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText(store.name + '\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(store.address + '\n'));
    commands.push(...encodeText(store.phone + '\n'));
    commands.push(...leftAlign());
    commands.push(...hr());

    // Title
    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText('LAPORAN CLOSING KASIR\n'));
    commands.push(...boldOff());
    commands.push(...leftAlign());
    commands.push(...hr());

    // Session info
    commands.push(...encodeText(`Tanggal : ${data.date}\n`));
    commands.push(...encodeText(`Kasir   : ${data.cashierName}\n`));
    commands.push(...encodeText(`Buka    : ${data.openedAt}\n`));
    commands.push(...encodeText(`Tutup   : ${data.closedAt}\n`));
    commands.push(...encodeText(`Durasi  : ${data.duration}\n`));
    commands.push(...hr());

    // Summary
    commands.push(...boldOn());
    commands.push(...encodeText('RINGKASAN TRANSAKSI\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Total Transaksi : ${data.totalTransactions}\n`));
    commands.push(...encodeText(`Total Penjualan : Rp ${data.totalRevenue.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Total Profit    : Rp ${data.totalProfit.toLocaleString('id-ID')}\n`));
    commands.push(...hr());

    // Payment breakdown
    commands.push(...boldOn());
    commands.push(...encodeText('BREAKDOWN PEMBAYARAN\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Tunai    : Rp ${data.cashTotal.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Non Tunai: Rp ${data.nonCashTotal.toLocaleString('id-ID')}\n`));
    commands.push(...hr());

    // Settlement
    commands.push(...boldOn());
    commands.push(...encodeText('SETTLEMENT\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Saldo Awal    : Rp ${data.openingCash.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Cash Sales    : Rp ${data.cashSales.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Expected Cash : Rp ${data.expectedCash.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Uang Fisik    : Rp ${data.physicalCash.toLocaleString('id-ID')}\n`));
    commands.push(...boldOn());
    commands.push(...encodeText(`Selisih       : Rp ${data.difference.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Status        : ${data.settlementStatus.toUpperCase()}\n`));
    commands.push(...boldOff());
    commands.push(...hr());

    // Top products
    if (data.topProducts.length > 0) {
        commands.push(...boldOn());
        commands.push(...encodeText('PRODUK TERLARIS\n'));
        commands.push(...boldOff());
        data.topProducts.slice(0, 5).forEach((p, i) => {
            commands.push(...encodeText(`${i + 1}. ${p.name}\n`));
            commands.push(...encodeText(`   ${p.quantity}x Rp ${p.revenue.toLocaleString('id-ID')}\n`));
        });
        commands.push(...hr());
    }

    // Signature
    commands.push(...encodeText('TTD Kasir: ____________\n'));
    commands.push(...encodeText('TTD Supervisor: ________\n'));
    commands.push(...feedLines(1));
    commands.push(...cutPaper());

    return commands;
}
