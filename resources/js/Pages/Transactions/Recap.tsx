import {
    AppNotifications,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { formatRupiah, formatDateTime } from '@/lib/format';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    LogOut,
    Scale,
    BarChart3,
} from 'lucide-react';
import { PosSidebar } from '@/Components/pos/pos-sidebar';
import { LogoutModal } from '@/Components/pos/logout-modal';

interface CashierSession {
    id?: number;
    opened_at?: string;
}

interface Summary {
    total_transactions: number;
    revenue_total: number;
    profit_total: number;
    cash_total: number;
    non_cash_total: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    items_count: number;
    customer_type: string;
    total_amount: number;
    payment_method: string;
}

interface TopProduct {
    product_name: string;
    image_url?: string;
    quantity: number;
    revenue: number;
}

const STORE_CONFIG = {
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

const placeholderImage = '/images/product-placeholder.svg';

export default function CashierRecap({
    cashierSession,
    summary,
    transactions,
    topProducts,
}: {
    cashierSession: CashierSession | null;
    summary: Summary;
    transactions: Transaction[];
    topProducts: TopProduct[];
}) {
    const { auth, flash } = usePage<SharedData>().props;
    const [activeMenu, setActiveMenu] = useState('report');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const hasOpenSession = Boolean(cashierSession?.id);

    const menuItems = [
        {
            id: 'cashier',
            label: 'Transaksi Kasir',
            icon: FileText,
            onClick: () => {
                setActiveMenu('cashier');
                router.visit(route('transactions.create'));
            },
        },
        {
            id: 'settlement',
            label: 'Settlement / Tutup',
            icon: Scale,
            onClick: () => {
                setActiveMenu('settlement');
                router.visit(route('transactions.create'));
            },
        },
        {
            id: 'report',
            label: 'Rekap Penjualan',
            icon: BarChart3,
            onClick: () => {
                setActiveMenu('report');
                router.visit(route('transactions.recap'));
            },
        },
        {
            id: 'logout',
            label: 'Keluar',
            icon: LogOut,
            onClick: () => {
                setActiveMenu('logout');

                if (hasOpenSession) {
                    notifyWarning(
                        'Kasir masih terbuka. Selesaikan settlement / tutup kasir terlebih dahulu sebelum logout.',
                        'Logout diblokir',
                    );
                    router.visit(route('transactions.create'));
                    return;
                }

                setShowLogoutModal(true);
            },
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Head title="Rekap Penjualan - Graha Motor" />
            <AppNotifications flash={flash} />

            <div
                className={cn(
                    'mx-auto min-h-screen max-w-[1800px] lg:grid',
                    sidebarCollapsed
                        ? 'lg:grid-cols-[88px_minmax(0,1fr)]'
                        : 'lg:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]',
                )}
            >
                <PosSidebar
                    activeMenu={activeMenu}
                    sidebarCollapsed={sidebarCollapsed}
                    hasOpenSession={hasOpenSession}
                    sessionOpenedAt={cashierSession?.opened_at}
                    user={auth?.user ?? { name: '' }}
                    storeAddress={STORE_CONFIG.address}
                    storePhone={STORE_CONFIG.phone}
                    menuItems={menuItems}
                    statusCardDescription="Rekap ditampilkan dari transaksi terakhir yang tersedia."
                    sessionButtonLabel={
                        hasOpenSession
                            ? 'Kembali ke Kasir'
                            : 'Buka Kasir'
                    }
                    sessionButtonCollapsedLabel={
                        hasOpenSession ? 'Kasir' : 'Buka'
                    }
                    onSessionButtonClick={() =>
                        router.visit(route('transactions.create'))
                    }
                />

                <main className="space-y-5 p-4 sm:p-5 xl:p-6">
                    <div className="hidden lg:block">
                        <button
                            onClick={() =>
                                setSidebarCollapsed((current) => !current)
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            title={
                                sidebarCollapsed
                                    ? 'Buka sidebar'
                                    : 'Tutup sidebar'
                            }
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight />
                            ) : (
                                <ChevronLeft />
                            )}
                            <span>
                                {sidebarCollapsed ? 'Buka Menu' : 'Tutup Menu'}
                            </span>
                        </button>
                    </div>

                    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                    Rekap Penjualan
                                </div>
                                <div className="mt-2 text-2xl font-bold text-slate-950">
                                    Ringkasan transaksi kasir
                                </div>
                                <div className="mt-2 text-sm font-semibold text-slate-500">
                                    Halaman ini dipisah dari layar transaksi
                                    agar operasional kasir tetap fokus dan
                                    laporan lebih mudah dirawat.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        router.visit(
                                            route('transactions.create'),
                                        )
                                    }
                                    className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
                                >
                                    Kembali ke Kasir
                                </button>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={(event) => {
                                        if (hasOpenSession) {
                                            event.preventDefault();
                                            notifyWarning(
                                                'Kasir masih terbuka. Selesaikan settlement / tutup kasir terlebih dahulu sebelum logout.',
                                                'Logout diblokir',
                                            );
                                            router.visit(
                                                route('transactions.create'),
                                            );
                                            return;
                                        }
                                    }}
                                    className="rounded-3xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
                                >
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                Total Transaksi
                            </div>
                            <div className="mt-2 text-2xl font-bold text-slate-950">
                                {summary.total_transactions}
                            </div>
                        </div>
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                Omzet
                            </div>
                            <div className="mt-2 text-2xl font-bold text-slate-950">
                                Rp {formatRupiah(summary.revenue_total)}
                            </div>
                        </div>
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                Profit
                            </div>
                            <div className="mt-2 text-2xl font-bold text-slate-950">
                                Rp {formatRupiah(summary.profit_total)}
                            </div>
                        </div>
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                Tunai
                            </div>
                            <div className="mt-2 text-2xl font-bold text-slate-950">
                                Rp {formatRupiah(summary.cash_total)}
                            </div>
                        </div>
                        <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-sm">
                            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                Non Tunai
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                Rp {formatRupiah(summary.non_cash_total)}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                            <div className="text-lg font-bold text-slate-950">
                                Transaksi Terbaru
                            </div>
                            <div className="mt-4 space-y-3">
                                {transactions.length === 0 && (
                                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                                        Belum ada transaksi untuk direkap.
                                    </div>
                                )}

                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-slate-950">
                                                    {transaction.invoice_number}
                                                </div>
                                                <div className="mt-1 text-xs font-semibold text-slate-500">
                                                    {formatDateTime(
                                                        transaction.created_at,
                                                    )}{' '}
                                                    • {transaction.items_count}{' '}
                                                    item •{' '}
                                                    {transaction.customer_type ===
                                                    'workshop'
                                                        ? 'Bengkel'
                                                        : 'Umum'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-950">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        transaction.total_amount,
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs font-bold text-slate-400 uppercase">
                                                    {transaction.payment_method}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                            <div className="text-lg font-bold text-slate-950">
                                Produk Paling Laku
                            </div>
                            <div className="mt-4 space-y-3">
                                {topProducts.length === 0 && (
                                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                                        Belum ada data produk laku.
                                    </div>
                                )}

                                {topProducts.map((product, index) => (
                                    <div
                                        key={`${product.product_name}-${index}`}
                                        className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <img
                                            src={
                                                product.image_url ||
                                                placeholderImage
                                            }
                                            alt={product.product_name}
                                            className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="line-clamp-2 text-sm font-bold text-slate-950">
                                                {product.product_name}
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-slate-500">
                                                {product.quantity} item terjual
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-950">
                                                Rp{' '}
                                                {formatRupiah(product.revenue)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <LogoutModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />
        </div>
    );
}
