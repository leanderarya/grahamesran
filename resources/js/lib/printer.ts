import { isNative } from './capacitor';

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
    return [GS, 0x56, 0x00];
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

    commands.push(...feedLines(2));
    commands.push(...centerAlign());
    commands.push(...encodeText('*** TERIMA KASIH ***\n'));
    commands.push(
        ...encodeText('Barang yang dibeli tidak dapat ditukar/dikembalikan\n'),
    );
    commands.push(...feedLines(3));
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
        // Dynamic import to avoid loading native plugin on web
        const plugin = (await import(
            '@candraadiw/capacitor-bluetooth-printer'
        )) as unknown as { BluetoothPrinter: { listDevices: () => Promise<{ devices: Array<{ name: string; address: string; type: string }> }>; connect: (opts: { address: string }) => Promise<void>; print: (opts: { data: string }) => Promise<{ success: boolean }>; disconnect: () => Promise<void> } };
        const { BluetoothPrinter } = plugin;

        // List paired devices
        const { devices } = await BluetoothPrinter.listDevices();

        if (!devices || devices.length === 0) {
            throw new Error(
                'Tidak ada printer Bluetooth yang terpasang. Silakan pasangkan printer terlebih dahulu.',
            );
        }

        // Connect to first available printer
        await BluetoothPrinter.connect({ address: devices[0].address });

        // Generate ESC/POS data and convert to string for the plugin
        const escPosBytes = generateEscPos(data, store);
        const escPosString = bytesToString(escPosBytes);

        // Send to printer
        await BluetoothPrinter.print({ data: escPosString });

        // Disconnect
        await BluetoothPrinter.disconnect();
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : 'Gagal mencetak struk.';
        throw new Error(message);
    }
}
