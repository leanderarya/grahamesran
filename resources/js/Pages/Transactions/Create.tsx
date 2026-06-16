import {
    AppNotifications,
    notifyError,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { ShoppingCart, Search, Trash2, Minus, Plus, Calculator, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/Components/pos/product-card';
import { CategoryGrid } from '@/Components/pos/category-grid';
import { VehicleFilter } from '@/Components/pos/vehicle-filter';
import { PosSidebar } from '@/Components/pos/pos-sidebar';
import { LogoutModal } from '@/Components/pos/logout-modal';
import { OpenSessionModal } from '@/Components/pos/open-session-modal';
import { SettlementModal } from '@/Components/pos/settlement-modal';
import { formatRupiah, formatDateTime } from '@/lib/format';

interface Product {
    id: number;
    name: string;
    category: string | null;
    sku?: string;
    stock: number | string;
    sell_price: number | string;
    workshop_price?: number | string;
    volume_liter?: number | string;
    image_url?: string;
    vehicles?: { brand?: string; model?: string }[];
}

interface CartItem extends Product {
    qty: number;
}

interface CashierSession {
    id?: number;
    opening_cash?: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    transactions_count?: number;
    opened_at?: string;
}

interface ReceiptData {
    invoice: string;
    date: string;
    items: CartItem[];
    total: number;
    payAmount: number;
    change: number;
    paymentMethod: string;
    cashier?: string;
    customerType: string;
}

const STORE_CONFIG = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');
const formatSignedCurrency = (value: number) =>
    `${value < 0 ? '-' : ''}Rp ${formatRupiah(Math.abs(value || 0))}`;
const formatVolume = (value: number | string | null | undefined) => {
    const numeric = Number(value);
    if (!numeric) return null;
    return `${numeric.toString().replace(/\.0+$/, '')}L`;
};
const getProductLabel = (product: Product | CartItem | null | undefined) => {
    if (!product) return '';
    const volume = formatVolume(product.volume_liter);
    return volume ? `${product.name} (${volume})` : product.name;
};
const placeholderImage = '/images/product-placeholder.svg';
const interactiveSurface =
    'transition-all duration-200 ease-out shadow-sm hover:shadow-md';
const formSurface =
'border border-slate-200 bg-white transition-all duration-200 ease-out';

export default function TabletPOS({ products, categories, cashierSession }: { products: Product[]; categories: string[]; cashierSession: CashierSession | null }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [activeMenu, setActiveMenu] = useState('cashier');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [showMobileCheckout, setShowMobileCheckout] = useState(false);
    const [customerType, setCustomerType] = useState('general');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showOpenSessionModal, setShowOpenSessionModal] =
        useState(!cashierSession);
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [openingCash, setOpeningCash] = useState('');
    const [openingNotes, setOpeningNotes] = useState('');
    const [closingCashPhysical, setClosingCashPhysical] = useState('');
    const [closingNotes, setClosingNotes] = useState('');
    const [isOpeningSession, setIsOpeningSession] = useState(false);
    const [isClosingSession, setIsClosingSession] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionState, setSessionState] = useState<CashierSession | null>(cashierSession);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data, setData, reset } = useForm<{ cart: CartItem[] }>({ cart: [] });

    useEffect(() => {
        setSessionState(cashierSession ?? null);
        setShowOpenSessionModal(!cashierSession);
    }, [cashierSession]);

    const hasOpenSession = Boolean(sessionState?.id);
    const isWorkshop = customerType === 'workshop';
    const deferredSearch = useDeferredValue(search);

    const productById = useMemo(() => {
        const map = new Map();
        for (const product of products) map.set(product.id, product);
        return map;
    }, [products]);

    const vehicleBrands = useMemo(() => {
        const brands = new Set<string>();
        products.forEach((p) =>
            p.vehicles?.forEach((v) => {
                if (v.brand !== 'UNIVERSAL') brands.add(v.brand!);
            }),
        );
        return ['all', ...Array.from(brands).sort()];
    }, [products]);

    const vehicleFilteredProducts = useMemo(() => {
        if (selectedVehicle === 'all') return products;
        return products.filter((p) =>
            p.vehicles?.some((v) => v.brand === selectedVehicle),
        );
    }, [products, selectedVehicle]);

    const categoryGroups = useMemo(() => {
        const groups: Record<string, number> = {};
        vehicleFilteredProducts.forEach((p) => {
            const cat = p.category || 'Lainnya';
            groups[cat] = (groups[cat] || 0) + 1;
        });
        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, count]) => ({ name, count }));
    }, [vehicleFilteredProducts]);

    const categoryProducts = useMemo(() => {
        if (!selectedCategory) return [];
        return vehicleFilteredProducts.filter(
            (p) => (p.category || 'Lainnya') === selectedCategory,
        );
    }, [vehicleFilteredProducts, selectedCategory]);

    const filteredProducts = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();
        if (!query) return null;

        const base = vehicleFilteredProducts.filter(
            (product: Product) =>
                product.name.toLowerCase().includes(query) ||
                (product.sku || '').toLowerCase().includes(query) ||
                (product.vehicles?.some((vehicle: { model?: string }) =>
                    (vehicle.model || '').toLowerCase().includes(query),
                ) ??
                    false),
        );
        return base.slice(0, 40);
    }, [deferredSearch, vehicleFilteredProducts]);

    useEffect(() => {
        if (deferredSearch.trim()) {
            setSelectedCategory(null);
        }
    }, [deferredSearch]);

    const getProductPrice = useCallback(
        (product: Product | CartItem | null | undefined) => {
            const workshopPrice = Number(product?.workshop_price) || 0;
            const sellPrice = Number(product?.sell_price) || 0;
            return customerType === 'workshop' && workshopPrice > 0
                ? workshopPrice
                : sellPrice;
        },
        [customerType],
    );

    const totalAmount = useMemo(
        () =>
            data.cart.reduce((sum, item) => {
                const product = productById.get(item.id);
                return (
                    sum +
                    getProductPrice(product || item) * (Number(item.qty) || 0)
                );
            }, 0),
        [data.cart, getProductPrice, productById],
    );

    const cashShortcutAmounts = useMemo(() => {
        const roundUpToNearest = (amount: number, nearest: number) =>
            Math.ceil((amount || 0) / nearest) * nearest;

        const candidates = [
            totalAmount,
            20000,
            50000,
            100000,
            200000,
            roundUpToNearest(totalAmount, 5000),
            roundUpToNearest(totalAmount, 10000),
            roundUpToNearest(totalAmount, 50000),
        ];

        return [
            ...new Set(
                candidates.filter(
                    (amount) => amount >= totalAmount && amount > 0,
                ),
            ),
        ]
            .sort((a, b) => a - b)
            .slice(0, 6);
    }, [totalAmount]);

    const change = useMemo(() => {
        if (paymentMethod !== 'cash') return 0;
        return (Number(cashReceived || 0) || 0) - totalAmount;
    }, [cashReceived, paymentMethod, totalAmount]);

    const expectedCash =
        Number(sessionState?.opening_cash || 0) +
        Number(sessionState?.cash_sales_total || 0);
    const settlementDifference =
        Number(closingCashPhysical || 0) - expectedCash;
    const settlementStatus =
        settlementDifference === 0
            ? 'balance'
            : settlementDifference < 0
              ? 'minus'
              : 'over';

    const addToCart = useCallback(
        (product: Product) => {
            if (!hasOpenSession) {
                setShowOpenSessionModal(true);
                return;
            }

            const existing = data.cart.find((item) => item.id === product.id);
            const stock = Number(product.stock) || 0;

            if (existing && Number(existing.qty || 0) + 1 > stock) {
                notifyWarning(
                    `Stok ${getProductLabel(product)} tinggal ${stock}.`,
                    'Stok terbatas',
                );
                return;
            }

            if (existing) {
                setData(
                    'cart',
                    data.cart.map((item) =>
                        item.id === product.id
                            ? { ...item, qty: Number(item.qty || 0) + 1 }
                            : item,
                    ),
                );
                return;
            }

            setData('cart', [...data.cart, { ...product, qty: 1 }]);
        },
        [data.cart, hasOpenSession, setData],
    );

    const updateQty = useCallback(
        (id: number, delta: number) => {
            setData(
                'cart',
                data.cart.map((item) => {
                    if (item.id !== id) return item;

                    const stock = Number(productById.get(id)?.stock || 0);
                    const nextQty = Math.max(1, Number(item.qty || 1) + delta);

                    if (nextQty > stock) {
                        notifyWarning(
                            `Jumlah maksimal untuk item ini adalah ${stock}.`,
                            'Melebihi stok',
                        );
                        return item;
                    }

                    return { ...item, qty: nextQty };
                }),
            );
        },
        [data.cart, productById, setData],
    );

    const removeItem = useCallback(
        (id: number) => {
            setData(
                'cart',
                data.cart.filter((item) => item.id !== id),
            );
        },
        [data.cart, setData],
    );

    const clearCart = useCallback(() => {
        setData('cart', []);
    }, [setData]);

    const handleOpenSession = useCallback(() => {
        setIsOpeningSession(true);

        router.post(
            route('transactions.session.open'),
            {
                opening_cash: Number(openingCash || 0),
                opening_notes: openingNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSessionState({
                        id: Date.now(),
                        opening_cash: Number(openingCash || 0),
                        cash_sales_total: 0,
                        non_cash_sales_total: 0,
                        transactions_count: 0,
                        opened_at: new Date().toISOString(),
                    });
                    setOpeningCash('');
                    setOpeningNotes('');
                    setShowOpenSessionModal(false);
                },
                onError: (errors: Record<string, string>) => {
                    notifyError(errors?.opening_cash || 'Gagal membuka kasir.');
                },
                onFinish: () => setIsOpeningSession(false),
            },
        );
    }, [openingCash, openingNotes]);

    const handleCloseSession = useCallback(() => {
        if (data.cart.length > 0) {
            notifyWarning(
                'Kosongkan keranjang sebelum tutup kasir.',
                'Keranjang masih terisi',
            );
            return;
        }

        setIsClosingSession(true);

        router.post(
            route('transactions.session.close'),
            {
                closing_cash_physical: Number(closingCashPhysical || 0),
                closing_notes: closingNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSessionState(null);
                    setClosingCashPhysical('');
                    setClosingNotes('');
                    setShowSettlementModal(false);
                    setShowOpenSessionModal(true);
                    reset();
                    setSearch('');
                    setCashReceived('');
                },
                onError: (errors: Record<string, string>) => {
                    notifyError(
                        errors?.closing_cash_physical || 'Gagal menutup kasir.',
                    );
                },
                onFinish: () => setIsClosingSession(false),
            },
        );
    }, [closingCashPhysical, closingNotes, data.cart.length, reset]);

    const processPayment = useCallback(() => {
        if (!hasOpenSession) {
            setShowOpenSessionModal(true);
            return;
        }

        const finalPaid =
            paymentMethod === 'cash' ? Number(cashReceived || 0) : totalAmount;

        if (paymentMethod === 'cash' && finalPaid < totalAmount) {
            notifyWarning('Uang pembayaran kurang.', 'Pembayaran belum cukup');
            return;
        }

        setIsProcessing(true);

        const finalChange =
            paymentMethod === 'cash' ? finalPaid - totalAmount : 0;
        const finalCart = data.cart.map((item) => {
            const product = productById.get(item.id);
            return {
                ...item,
                name: product?.name ?? item.name,
                volume_liter: product?.volume_liter ?? item.volume_liter,
                sell_price: getProductPrice(product || item),
            };
        });

        router.post(
            route('transactions.store'),
            {
                cart: finalCart,
                payment_method: paymentMethod,
                amount_paid: finalPaid,
                change_amount: finalChange,
                customer_type: customerType,
            },
            {
                onSuccess: () => {
                    setSessionState((current: CashierSession | null) =>
                        current
                            ? {
                                  ...current,
                                  transactions_count:
                                      Number(current.transactions_count || 0) +
                                      1,
                                  cash_sales_total:
                                      Number(current.cash_sales_total || 0) +
                                      (paymentMethod === 'cash'
                                          ? totalAmount
                                          : 0),
                                  non_cash_sales_total:
                                      Number(
                                          current.non_cash_sales_total || 0,
                                      ) +
                                      (paymentMethod === 'cash'
                                          ? 0
                                          : totalAmount),
                              }
                            : current,
                    );

                    setReceiptData({
                        invoice: `INV-${Math.floor(Date.now() / 1000)}`,
                        date: new Date().toLocaleString('id-ID'),
                        items: finalCart,
                        total: totalAmount,
                        payAmount: finalPaid,
                        change: finalChange,
                        paymentMethod: paymentMethod.toUpperCase(),
                        cashier: auth?.user?.name,
                        customerType:
                            customerType === 'workshop' ? 'BENGKEL' : 'UMUM',
                    });

                    setTimeout(() => {
                        window.print();
                        reset();
                        setCashReceived('');
                    }, 250);
                },
                onError: (errors: Record<string, string>) => {
                    const message =
                        errors?.cart ||
                        errors?.payment_method ||
                        errors?.amount_paid ||
                        'Gagal memproses transaksi.';
                    notifyError(message);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    }, [
        auth?.user?.name,
        cashReceived,
        customerType,
        data.cart,
        getProductPrice,
        hasOpenSession,
        paymentMethod,
        productById,
        reset,
        totalAmount,
    ]);

    const menuItems = [
        {
            id: 'cashier',
            label: 'Transaksi Kasir',
            icon: ShoppingCart,
            onClick: () => setActiveMenu('cashier'),
        },
        {
            id: 'settlement',
            label: 'Settlement / Tutup',
            icon: Calculator,
            onClick: () => {
                setActiveMenu('settlement');
                if (hasOpenSession) {
                    setShowSettlementModal(true);
                } else {
                    setShowOpenSessionModal(true);
                }
            },
        },
        {
            id: 'report',
            label: 'Rekap Penjualan',
            icon: FileText,
            onClick: () => router.visit(route('transactions.recap')),
        },
        {
            id: 'logout',
            label: 'Keluar',
            icon: LogOut, // <-- pastikan ini ada di mapping Icons kamu
            onClick: () => {
                setActiveMenu('logout');

                if (hasOpenSession) {
                    notifyWarning(
                        'Kasir masih terbuka. Selesaikan settlement / tutup kasir terlebih dahulu sebelum logout.',
                        'Logout diblokir',
                    );
                    setShowSettlementModal(true);
                    return;
                }

                setShowLogoutModal(true);
            },
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Head title="Kasir - Graha Motor" />
            <AppNotifications flash={flash} />

            <div
                className={cn(
                    'mx-auto min-h-screen max-w-[1800px] lg:grid',
                    sidebarCollapsed
                        ? 'lg:grid-cols-[88px_minmax(0,1fr)_360px] xl:grid-cols-[88px_minmax(0,1fr)_420px]'
                        : 'lg:grid-cols-[88px_minmax(0,1fr)_360px] xl:grid-cols-[260px_minmax(0,1fr)_420px]',
                )}
            >
                <PosSidebar
                    activeMenu={activeMenu}
                    sidebarCollapsed={sidebarCollapsed}
                    hasOpenSession={hasOpenSession}
                    sessionOpenedAt={sessionState?.opened_at}
                    user={auth?.user ?? { name: '' }}
                    storeAddress={STORE_CONFIG.address}
                    storePhone={STORE_CONFIG.phone}
                    menuItems={menuItems}
                    statusCardDescription="Masukkan saldo awal sebelum transaksi."
                    sessionButtonLabel={
                        hasOpenSession
                            ? 'Settlement / Tutup Kasir'
                            : 'Buka Kasir'
                    }
                    sessionButtonCollapsedLabel={
                        hasOpenSession ? 'Tutup' : 'Buka'
                    }
                    onSessionButtonClick={() =>
                        hasOpenSession
                            ? setShowSettlementModal(true)
                            : setShowOpenSessionModal(true)
                    }
                />

                <main className="contents">
                    <section className="space-y-5 p-4 pb-28 sm:p-5 sm:pb-32 lg:col-start-2 lg:p-5 lg:pb-5 xl:p-6 xl:pb-6">
                        <div className="hidden lg:block">
                            <button
                                onClick={() =>
                                    setSidebarCollapsed((current) => !current)
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                                    {sidebarCollapsed
                                        ? 'Buka Menu'
                                        : 'Tutup Menu'}
                                </span>
                            </button>
                        </div>

                        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() =>
                                            setCustomerType('general')
                                        }
                                        className={cn(
                                            'rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                            !isWorkshop
                                                ? 'bg-slate-950 text-white'
                                                : 'bg-slate-100 text-slate-600',
                                        )}
                                    >
                                        Pelanggan Umum
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCustomerType('workshop')
                                        }
                                        className={cn(
                                            'rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                            isWorkshop
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-amber-50 text-amber-700',
                                        )}
                                    >
                                        Bengkel
                                    </button>
                                </div>

                                <div className="text-sm font-semibold text-slate-500">
                                    {filteredProducts ? filteredProducts.length : vehicleFilteredProducts.length} produk tampil
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                                <VehicleFilter
                                    brands={vehicleBrands}
                                    selected={selectedVehicle}
                                    onChange={(brand) => {
                                        setSelectedVehicle(brand);
                                        setSelectedCategory(null);
                                    }}
                                />
                                 <div
                                    className={cn(
                                        'flex flex-1 items-center gap-3 rounded-3xl px-4 py-3',
                                        formSurface,
                                    )}
                                >
                                    <div className="text-slate-400">
                                        <Search />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari barang, SKU, atau model motor..."
                                        className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                    Saldo Awal
                                </div>
                                <div className="mt-2 text-xl font-bold text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.opening_cash || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                    Cash Masuk
                                </div>
                                <div className="mt-2 text-xl font-bold text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.cash_sales_total || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                    Non Cash
                                </div>
                                <div className="mt-2 text-xl font-bold text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.non_cash_sales_total || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-sm">
                                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                    Expected Cash
                                </div>
                                <div className="mt-2 text-xl font-bold">
                                    Rp {formatRupiah(expectedCash)}
                                </div>
                            </div>
                        </div>

                        {filteredProducts ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        customerType={customerType}
                                        onAdd={addToCart}
                                    />
                                ))}

                                {filteredProducts.length === 0 && (
                                    <p className="col-span-full py-8 text-center text-sm text-slate-400">
                                        Barang tidak ditemukan.
                                    </p>
                                )}
                            </div>
                        ) : selectedCategory ? (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        ← Kembali
                                    </button>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                        {selectedCategory}
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        {categoryProducts.length} item
                                    </span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                    {categoryProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            customerType={customerType}
                                            onAdd={addToCart}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="mb-3 text-base font-bold text-slate-800 dark:text-slate-100">
                                    Pilih Kategori
                                </h3>
                                <CategoryGrid
                                    groups={categoryGroups}
                                    onSelect={setSelectedCategory}
                                />
                            </div>
                        )}
                    </section>

                    <section
                        className={cn(
                            'space-y-5 border-t border-slate-200 bg-slate-100 p-4 pb-28 sm:p-5 sm:pb-32 lg:col-start-3 lg:border-t-0 lg:border-l lg:p-5 lg:pb-5 xl:p-6 xl:pb-6',
                            !showMobileCheckout && 'hidden lg:block',
                        )}
                    >
                        <div className="rounded-[2rem] bg-white p-5 shadow-sm lg:sticky lg:top-5 xl:top-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                        Keranjang
                                    </div>
                                    <div className="mt-2 text-2xl font-bold text-slate-950">
                                        {data.cart.length} item
                                    </div>
                                </div>
                                <button
                                    onClick={clearCart}
                                    className="rounded-2xl bg-red-50 px-3 py-3 text-sm font-bold text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 hover:shadow-md"
                                >
                                    Hapus Semua
                                </button>
                            </div>

                            <div className="mt-5 max-h-[300px] space-y-3 overflow-y-auto pr-1 xl:max-h-[360px]">
                                {data.cart.length === 0 && (
                                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                                        <div className="text-base font-bold text-slate-900">
                                            Keranjang masih kosong
                                        </div>
                                        <div className="mt-2 text-sm font-semibold text-slate-500">
                                            Pilih produk di panel tengah untuk
                                            mulai transaksi.
                                        </div>
                                    </div>
                                )}

                                {data.cart.map((item) => {
                                    const product =
                                        productById.get(item.id) || item;
                                    const price = getProductPrice(product);

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 flex-1 gap-3">
                                                    <img
                                                        src={
                                                            product.image_url ||
                                                            item.image_url ||
                                                            placeholderImage
                                                        }
                                                        alt={getProductLabel(
                                                            item,
                                                        )}
                                                        className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-cover"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="line-clamp-2 text-sm font-bold text-slate-900">
                                                            {getProductLabel(
                                                                item,
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-xs font-semibold text-slate-500">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                price,
                                                            )}{' '}
                                                            / item
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="rounded-2xl p-3 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 />
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                                    >
                                                        <Minus />
                                                    </button>
                                                    <div className="min-w-[48px] text-center text-lg font-bold text-slate-900">
                                                        {item.qty}
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                                    >
                                                        <Plus />
                                                    </button>
                                                </div>
                                                <div className="text-lg font-bold text-slate-950">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        price *
                                                            Number(
                                                                item.qty || 0,
                                                            ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                            <div className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">
                                Pembayaran
                            </div>

                            <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
                                <div className="text-sm font-semibold text-slate-400">
                                    Total tagihan
                                </div>
                                <div className="mt-2 text-3xl font-bold">
                                    Rp {formatRupiah(totalAmount)}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {[
                                    { id: 'cash', label: 'Tunai' },
                                    { id: 'qris', label: 'QRIS' },
                                    { id: 'bank', label: 'Transfer' },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() =>
                                            setPaymentMethod(method.id)
                                        }
                                        className={cn(
                                            'rounded-2xl px-3 py-4 text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                            paymentMethod === method.id
                                                ? 'bg-slate-950 text-white'
                                                : 'bg-slate-100 text-slate-600',
                                        )}
                                    >
                                        {method.label}
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="mt-4">
                                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                        Uang Diterima
                                    </label>
                                    <div
                                        className={cn(
                                            'mt-2 flex items-center rounded-2xl px-4 py-3',
                                            formSurface,
                                        )}
                                    >
                                        <span className="text-lg font-bold text-slate-500">
                                            Rp
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={cashReceived}
                                            onChange={(event) =>
                                                setCashReceived(
                                                    sanitizeNumericInput(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="0"
                                            className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                                        />
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {cashShortcutAmounts.map(
                                            (amount, index) => (
                                                <button
                                                    key={`${amount}-${index}`}
                                                    type="button"
                                                    onClick={() =>
                                                        setCashReceived(
                                                            String(amount),
                                                        )
                                                    }
                                                    className={cn(
                                                        'rounded-2xl border px-3 py-4 text-left text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md',
                                                        Number(
                                                            cashReceived || 0,
                                                        ) === amount
                                                            ? 'border-slate-950 bg-slate-950 text-white'
                                                            : amount ===
                                                                totalAmount
                                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                                                    )}
                                                >
                                                    {amount === totalAmount ? (
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                                                                Uang Pas
                                                            </div>
                                                            <div className="text-sm font-bold">
                                                                Rp{' '}
                                                                {formatRupiah(
                                                                    amount,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                amount,
                                                            )}
                                                        </div>
                                                    )}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            'mt-3 text-sm font-bold',
                                            change < 0
                                                ? 'text-red-600'
                                                : 'text-emerald-600',
                                        )}
                                    >
                                        {change < 0
                                            ? `Kurang ${formatSignedCurrency(change)}`
                                            : `Kembali Rp ${formatRupiah(change)}`}
                                    </div>
                                </div>
                            )}

                            {paymentMethod !== 'cash' && (
                                <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                                    Pembayaran non-tunai akan dianggap lunas
                                    sesuai nominal total.
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                        Mode Harga
                                    </div>
                                    <div className="mt-2 font-bold text-slate-950">
                                        {isWorkshop ? 'Bengkel' : 'Umum'}
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                        Status Sesi
                                    </div>
                                    <div className="mt-2 font-bold text-slate-950">
                                        {hasOpenSession
                                            ? 'Aktif'
                                            : 'Belum dibuka'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={processPayment}
                                disabled={
                                    !hasOpenSession ||
                                    data.cart.length === 0 ||
                                    isProcessing ||
                                    (paymentMethod === 'cash' && change < 0)
                                }
                                className="mt-5 w-full rounded-3xl bg-slate-950 px-4 py-4 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isProcessing
                                    ? 'Memproses...'
                                    : 'Selesaikan Transaksi'}
                            </button>

                            <button
                                onClick={() => setShowMobileCheckout(false)}
                                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md lg:hidden"
                            >
                                Kembali ke Katalog
                            </button>
                        </div>
                    </section>
                </main>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-xl items-center gap-3">
                    <button
                        onClick={() =>
                            setShowMobileCheckout((current) => !current)
                        }
                        className="flex-1 rounded-3xl bg-slate-950 px-4 py-4 text-left text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
                    >
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Checkout Mobile
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                                {data.cart.length} item di keranjang
                            </span>
                            <span className="text-lg font-bold">
                                Rp {formatRupiah(totalAmount)}
                            </span>
                        </div>
                    </button>
                    <button
                        onClick={() =>
                            hasOpenSession
                                ? setShowSettlementModal(true)
                                : setShowOpenSessionModal(true)
                        }
                        className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                    >
                        {hasOpenSession ? 'Tutup' : 'Buka'}
                    </button>
                </div>
            </div>

            <OpenSessionModal
                show={!hasOpenSession && showOpenSessionModal}
                onClose={() => setShowOpenSessionModal(false)}
                openingCash={openingCash}
                openingNotes={openingNotes}
                onOpeningCashChange={setOpeningCash}
                onOpeningNotesChange={setOpeningNotes}
                onSubmit={handleOpenSession}
                isOpeningSession={isOpeningSession}
            />

            <SettlementModal
                show={showSettlementModal && hasOpenSession}
                onClose={() => setShowSettlementModal(false)}
                sessionState={sessionState}
                closingCash={closingCashPhysical}
                closingNotes={closingNotes}
                onClosingCashChange={setClosingCashPhysical}
                onClosingNotesChange={setClosingNotes}
                onSubmit={handleCloseSession}
                isClosingSession={isClosingSession}
                expectedCash={expectedCash}
                settlementDifference={settlementDifference}
                settlementStatus={settlementStatus}
            />

            <LogoutModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />

            <div
                id="printable-area"
                className="hidden bg-white p-2 print:block"
            >
                <style>{`@media print { @page { margin: 0; size: auto; } body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
                <div className="mx-auto max-w-[58mm] font-mono text-[10px] leading-tight text-black">
                    <div className="mb-2 text-center">
                        <h2 className="text-xs font-bold uppercase">
                            {STORE_CONFIG.name}
                        </h2>
                        <p>{STORE_CONFIG.address}</p>
                        <p>{STORE_CONFIG.phone}</p>
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
                                        {Number(
                                            item.sell_price || 0,
                                        ).toLocaleString('id-ID')}
                                    </span>
                                    <span>
                                        {(
                                            Number(item.qty || 0) *
                                            Number(item.sell_price || 0)
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
        </div>
    );
}
