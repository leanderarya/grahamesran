import {
    AppNotifications,
    notifyError,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
import { ShoppingCart, Search, Calculator, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/Components/pos/product-card';
import { CategoryGrid } from '@/Components/pos/category-grid';
import { VehicleFilter } from '@/Components/pos/vehicle-filter';
import { PosSidebar } from '@/Components/pos/pos-sidebar';
import { LogoutModal } from '@/Components/pos/logout-modal';
import { OpenSessionModal } from '@/Components/pos/open-session-modal';
import { SettlementModal } from '@/Components/pos/settlement-modal';
import { formatRupiah, getProductLabel } from '@/lib/format';
import { CheckoutPanel } from '@/Components/pos/checkout-panel';
import { MobileBottomBar } from '@/Components/pos/mobile-bottom-bar';
import { PrintReceipt } from '@/Components/pos/print-receipt';

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

interface ActiveDraft {
    id: number;
    transaction_items?: {
        product: Product;
        quantity: number;
    }[];
}

const STORE_CONFIG = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

const formSurface =
'border border-slate-200 bg-white transition-all duration-200 ease-out';

export default function TabletPOS({ products, cashierSession, activeDraft }: { products: Product[]; categories?: string[]; cashierSession: CashierSession | null; activeDraft?: ActiveDraft | null }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [activeMenu, setActiveMenu] = useState('cashier');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [search, setSearch] = useState('');
    const [showMobileCheckout, setShowMobileCheckout] = useState(false);
    const [customerType, setCustomerType] = useState('general');
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
    const [sessionState, setSessionState] = useState<CashierSession | null>(cashierSession);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data, setData, reset } = useForm<{ cart: CartItem[] }>({ cart: [] });

    useEffect(() => {
        setSessionState(cashierSession ?? null);
        setShowOpenSessionModal(!cashierSession);
    }, [cashierSession]);

    useEffect(() => {
        if (activeDraft && activeDraft.transaction_items) {
            const restoredCart = activeDraft.transaction_items.map(item => ({
                ...item.product,
                qty: item.quantity,
            }));
            setData('cart', restoredCart);
        }
    }, [activeDraft, setData]);

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

    const totalQty = useMemo(
        () => data.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
        [data.cart],
    );

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

    const handleSaveDraft = useCallback(() => {
        if (data.cart.length === 0) return;

        router.post(route('transactions.draft.save'), {
            cart: data.cart.map(item => ({ id: item.id, qty: item.qty })),
            customer_type: customerType,
            draft_id: activeDraft?.id || null,
        });
    }, [data.cart, customerType, activeDraft]);

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


                        {filteredProducts ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        customerType={customerType}
                                        onAddToCart={addToCart}
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
                                            onAddToCart={addToCart}
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

                    <CheckoutPanel
                        cart={data.cart}
                        productById={productById}
                        getProductPrice={getProductPrice}
                        clearCart={clearCart}
                        removeItem={removeItem}
                        updateQty={updateQty}
                        totalAmount={totalAmount}
                        totalQty={totalQty}
                        isWorkshop={isWorkshop}
                        hasOpenSession={hasOpenSession}
                        onSaveDraft={handleSaveDraft}
                        showMobileCheckout={showMobileCheckout}
                        onCloseMobileCheckout={() => setShowMobileCheckout(false)}
                    />
                </main>
            </div>

            <MobileBottomBar
                cartCount={data.cart.length}
                totalAmount={totalAmount}
                hasOpenSession={hasOpenSession}
                onToggleCheckout={() => setShowMobileCheckout((current) => !current)}
                onSessionButtonClick={() =>
                    hasOpenSession
                        ? setShowSettlementModal(true)
                        : setShowOpenSessionModal(true)
                }
            />

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

            <PrintReceipt
                receiptData={null}
                storeName={STORE_CONFIG.name}
                storeAddress={STORE_CONFIG.address}
                storePhone={STORE_CONFIG.phone}
            />
        </div>
    );
}
