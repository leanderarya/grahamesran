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
import { ProductCard } from '@/Components/pos/product-card';
import { CategoryChips } from '@/Components/pos/category-chips';
import { TopBar } from '@/Components/pos/top-bar';
import { OpenSessionModal } from '@/Components/pos/open-session-modal';
import { SettlementModal } from '@/Components/pos/settlement-modal';
import { getProductLabel, formatRupiah } from '@/lib/format';
import { CheckoutPanel } from '@/Components/pos/checkout-panel';
import { MobileBottomBar } from '@/Components/pos/mobile-bottom-bar';
import { PrintReceipt } from '@/Components/pos/print-receipt';
import { ShoppingCart } from 'lucide-react';

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string | null;
    image_url: string | null;
    volume_liter: number | null;
    stock: number;
    sell_price: number;
    workshop_price: number | null;
    display_name: string;
    vehicles?: { brand?: string; model?: string }[];
}

interface CartItem {
    id: number;
    name: string;
    sku?: string;
    stock: number | string;
    sell_price: number | string;
    workshop_price?: number | string;
    volume_liter?: number | string;
    image_url?: string;
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

export default function TabletPOS({ products, cashierSession, activeDraft }: { products: Product[]; cashierSession: CashierSession | null; activeDraft?: ActiveDraft | null }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState('');
    const [showMobileCheckout, setShowMobileCheckout] = useState(false);
    const [showDesktopCheckout, setShowDesktopCheckout] = useState(true);
    const [customerType, setCustomerType] = useState('general');
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
            })) as CartItem[];
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

    const categoryGroups = useMemo(() => {
        const groups: Record<string, number> = {};
        products.forEach((p) => {
            const cat = p.category || 'Lainnya';
            groups[cat] = (groups[cat] || 0) + 1;
        });
        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, count]) => ({ name, count }));
    }, [products]);

    const displayProducts = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();

        let base = products;

        // Filter by category if selected
        if (selectedCategory && !query) {
            base = base.filter(
                (p) => (p.category || 'Lainnya') === selectedCategory,
            );
        }

        // Filter by search
        if (query) {
            base = base.filter(
                (product: Product) =>
                    product.name.toLowerCase().includes(query) ||
                    (product.sku || '').toLowerCase().includes(query) ||
                    (product.vehicles?.some((vehicle: { model?: string }) =>
                        (vehicle.model || '').toLowerCase().includes(query),
                    ) ?? false),
            );
            base = base.slice(0, 40);
        }

        return base;
    }, [products, deferredSearch, selectedCategory]);

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

            setData('cart', [...data.cart, { ...product, qty: 1 } as CartItem]);
        },
        [data.cart, hasOpenSession, setData],
    );

    const updateQty = useCallback(
        (id: number, delta: number) => {
            const item = data.cart.find((i) => i.id === id);
            if (!item) return;

            const currentQty = Number(item.qty || 1);
            const nextQty = currentQty + delta;

            // If qty would go to 0 or below, remove the item
            if (nextQty <= 0) {
                setData('cart', data.cart.filter((i) => i.id !== id));
                return;
            }

            const stock = Number(productById.get(id)?.stock || 0);
            if (nextQty > stock) {
                notifyWarning(
                    `Jumlah maksimal untuk item ini adalah ${stock}.`,
                    'Melebihi stok',
                );
                return;
            }

            setData(
                'cart',
                data.cart.map((i) =>
                    i.id === id ? { ...i, qty: nextQty } : i,
                ),
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

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title="Kasir - Graha Motor" />
            <AppNotifications flash={flash} />

            {/* Top Bar */}
            <TopBar
                search={search}
                onSearchChange={setSearch}
                hasOpenSession={hasOpenSession}
                userName={auth?.user?.name || ''}
                onSettlementClick={() =>
                    hasOpenSession
                        ? setShowSettlementModal(true)
                        : setShowOpenSessionModal(true)
                }
            />

            {/* Product Area — always full width */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Category Chips */}
                <div className="shrink-0 border-b border-slate-200 px-4 py-2.5">
                    <CategoryChips
                        groups={categoryGroups}
                        selected={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-4 gap-2">
                        {displayProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                customerType={customerType}
                                onAddToCart={addToCart}
                            />
                        ))}

                        {displayProducts.length === 0 && (
                            <p className="col-span-full py-12 text-center text-sm text-slate-400">
                                Barang tidak ditemukan.
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* Right Sidebar: Checkout — fixed to right edge */}
            {showDesktopCheckout && <CheckoutPanel
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
                    customerType={customerType}
                    onCustomerTypeChange={setCustomerType}
                    onSaveDraft={handleSaveDraft}
                    onCloseDesktop={() => setShowDesktopCheckout(false)}
                    showMobileCheckout={showMobileCheckout}
                    onCloseMobileCheckout={() => setShowMobileCheckout(false)}
                />}

            {/* Floating Cart Button — visible when desktop checkout is hidden */}
            {!showDesktopCheckout && data.cart.length > 0 && (
                <button
                    onClick={() => setShowDesktopCheckout(true)}
                    className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-indigo-700"
                >
                    <ShoppingCart className="h-4 w-4" />
                    {data.cart.length} item · Rp {formatRupiah(totalAmount)}
                </button>
            )}

            {/* Mobile Bottom Bar */}
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

            {/* Modals */}
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

            <PrintReceipt
                receiptData={null}
                storeName={STORE_CONFIG.name}
                storeAddress={STORE_CONFIG.address}
                storePhone={STORE_CONFIG.phone}
            />
        </div>
    );
}
