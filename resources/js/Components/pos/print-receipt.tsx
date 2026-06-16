import { getProductLabel } from '@/lib/format';

interface ReceiptItem {
    name: string;
    volume_liter?: number | string;
    sell_price: number | string;
    qty: number;
}

interface ReceiptData {
    invoice: string;
    date: string;
    items: ReceiptItem[];
    total: number;
    payAmount: number;
    change: number;
    paymentMethod: string;
    cashier?: string;
    customerType: string;
}

interface PrintReceiptProps {
    receiptData: ReceiptData | null;
    storeName: string;
    storeAddress: string;
    storePhone: string;
}

export function PrintReceipt({
    receiptData,
    storeName,
    storeAddress,
    storePhone,
}: PrintReceiptProps) {
    return (
        <div
            id="printable-area"
            className="hidden bg-white p-2 print:block"
        >
            <style>{`@media print { @page { margin: 0; size: auto; } body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
            <div className="mx-auto max-w-[58mm] font-mono text-[10px] leading-tight text-black">
                <div className="mb-2 text-center">
                    <h2 className="text-xs font-bold uppercase">
                        {storeName}
                    </h2>
                    <p>{storeAddress}</p>
                    <p>{storePhone}</p>
                </div>
                <div className="mb-2 border-b border-dashed border-black" />
                <div className="mb-2">
                    <div>No: {receiptData?.invoice}</div>
                    <div>Tgl: {receiptData?.date}</div>
                    <div>Kasir: {receiptData?.cashier}</div>
                    <div>Plg: {receiptData?.customerType}</div>
                </div>
                <div className="mb-2 border-b border-dashed border-black" />
                <div className="mb-2 space-y-1">
                    {receiptData?.items?.map((item, index) => (
                        <div key={index}>
                            <div className="font-bold">
                                {getProductLabel(item)}
                            </div>
                            <div className="flex justify-between pl-2">
                                <span>
                                    {item.qty} x{' '}
                                    {Number(item.sell_price || 0).toLocaleString('id-ID')}
                                </span>
                                <span>
                                    {(
                                        Number(item.qty || 0) * Number(item.sell_price || 0)
                                    ).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mb-2 border-b border-dashed border-black" />
                <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>TOTAL</span>
                    <span>
                        Rp {receiptData?.total?.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Bayar ({receiptData?.paymentMethod})</span>
                    <span>
                        Rp {receiptData?.payAmount?.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="mb-4 flex justify-between">
                    <span>Kembali</span>
                    <span>
                        Rp {receiptData?.change?.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="mt-4 text-center">
                    <p>*** TERIMA KASIH ***</p>
                    <p>
                        Barang yang dibeli tidak dapat ditukar/dikembalikan
                    </p>
                </div>
            </div>
        </div>
    );
}
