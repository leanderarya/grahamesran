// @ts-nocheck
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

const STORE_CONFIG = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

const cx = (...classes) => classes.filter(Boolean).join(' ');
const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID').format(value || 0);
const sanitizeNumericInput = (value) => value.replace(/[^\d]/g, '');
const formatDateTime = (value) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : '-';
const formatSignedCurrency = (value) =>
    `${value < 0 ? '-' : ''}Rp ${formatRupiah(Math.abs(value || 0))}`;
const formatVolume = (value) => {
    const numeric = Number(value);
    if (!numeric) return null;
    return `${numeric.toString().replace(/\.0+$/, '')}L`;
};
const getProductLabel = (product) => {
    if (!product) return '';
    const volume = formatVolume(product.volume_liter);
    return volume ? `${product.name} (${volume})` : product.name;
};
const placeholderImage = '/images/product-placeholder.svg';
const interactiveSurface =
    'transition-all duration-200 ease-out shadow-sm hover:shadow-md';
const formSurface =
    'border border-slate-200 bg-white transition-all duration-200 ease-out';

const Icons = {
    Sidebar: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    ),
    ChevronLeft: () => (
        <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
            />
        </svg>
    ),
    ChevronRight: () => (
        <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
            />
        </svg>
    ),
    Search: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m1.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    ),
    Cashier: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7h16M6 11h12M6 15h7m-9 6h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    ),
    Balance: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-2.21 0-4 1.79-4 4m8 0a4 4 0 00-4-4m0 0V4m0 8l3 3m-3-3l-3 3m9 4H6"
            />
        </svg>
    ),
    Report: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-6m4 6V7m4 10v-3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
        </svg>
    ),
    Settings: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317a1 1 0 011.35-.936l1.62.66a1 1 0 00.78 0l1.62-.66a1 1 0 011.35.936l.18 1.74a1 1 0 00.54.79l1.5.84a1 1 0 01.42 1.32l-.72 1.59a1 1 0 000 .82l.72 1.59a1 1 0 01-.42 1.32l-1.5.84a1 1 0 00-.54.79l-.18 1.74a1 1 0 01-1.35.936l-1.62-.66a1 1 0 00-.78 0l-1.62.66a1 1 0 01-1.35-.936l-.18-1.74a1 1 0 00-.54-.79l-1.5-.84a1 1 0 01-.42-1.32l.72-1.59a1 1 0 000-.82l-.72-1.59a1 1 0 01.42-1.32l1.5-.84a1 1 0 00.54-.79l.18-1.74z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            />
        </svg>
    ),
    Logout: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H9"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7"
            />
        </svg>
    ),
    Close: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    ),
    Minus: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 12H4"
            />
        </svg>
    ),
    Plus: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
            />
        </svg>
    ),
    Trash: () => (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
        </svg>
    ),
};

const ProductCard = ({ product, customerType, onAdd }) => {
    const stock = Number(product.stock) || 0;
    const isOut = stock <= 0;
    const workshopPrice = Number(product.workshop_price) || 0;
    const sellPrice = Number(product.sell_price) || 0;
    const activePrice =
        customerType === 'workshop' && workshopPrice > 0
            ? workshopPrice
            : sellPrice;

    return (
        <button
            type="button"
            onClick={() => !isOut && onAdd(product)}
            className={cx(
                'rounded-3xl border p-3 text-left',
                interactiveSurface,
                isOut
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
            )}
        >
            <div className="flex items-center gap-3">
                <img
                    src={product.image_url || placeholderImage}
                    alt={getProductLabel(product)}
                    className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50 object-cover"
                />
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-black tracking-widest text-slate-400 uppercase">
                        {product.sku || 'NOSKU'}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm font-black text-slate-900">
                        {getProductLabel(product)}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <div
                            className={cx(
                                'rounded-full px-2.5 py-1 text-[10px] font-black uppercase',
                                isOut
                                    ? 'bg-red-100 text-red-700'
                                    : stock <= 5
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700',
                            )}
                        >
                            {isOut ? 'Habis' : `Stok ${stock}`}
                        </div>
                        <div
                            className={cx(
                                'text-sm font-black',
                                customerType === 'workshop' && workshopPrice > 0
                                    ? 'text-amber-600'
                                    : 'text-slate-900',
                            )}
                        >
                            Rp {formatRupiah(activePrice)}
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
};

export default function TabletPOS({ products, cashierSession }) {
    const { auth, flash } = usePage().props;
    const [activeMenu, setActiveMenu] = useState('cashier');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [showMobileCheckout, setShowMobileCheckout] = useState(false);
    const [customerType, setCustomerType] = useState('general');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [receiptData, setReceiptData] = useState(null);
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
    const [sessionState, setSessionState] = useState(cashierSession);
    const { data, setData, reset } = useForm({ cart: [] });

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

    const filteredProducts = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();

        const base = !query
            ? products
            : products.filter(
                  (product) =>
                      product.name.toLowerCase().includes(query) ||
                      (product.sku || '').toLowerCase().includes(query) ||
                      (product.vehicles?.some((vehicle) =>
                          (vehicle.model || '').toLowerCase().includes(query),
                      ) ??
                          false),
              );

        return base.slice(0, 40);
    }, [deferredSearch, products]);

    const getProductPrice = useCallback(
        (product) => {
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
        const roundUpToNearest = (amount, nearest) =>
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
        (product) => {
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
        (id, delta) => {
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
        (id) => {
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
                onError: (errors) => {
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
                onError: (errors) => {
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
                    setSessionState((current) =>
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
                onError: (errors) => {
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
            icon: Icons.Cashier,
            onClick: () => setActiveMenu('cashier'),
        },
        {
            id: 'settlement',
            label: 'Settlement / Tutup',
            icon: Icons.Balance,
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
            icon: Icons.Report,
            onClick: () => router.visit(route('transactions.recap')),
        },
        {
            id: 'logout',
            label: 'Keluar',
            icon: Icons.Logout, // <-- pastikan ini ada di mapping Icons kamu
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
                className={cx(
                    'mx-auto min-h-screen max-w-[1800px] lg:grid',
                    sidebarCollapsed
                        ? 'lg:grid-cols-[88px_minmax(0,1fr)_360px] xl:grid-cols-[88px_minmax(0,1fr)_420px]'
                        : 'lg:grid-cols-[88px_minmax(0,1fr)_360px] xl:grid-cols-[260px_minmax(0,1fr)_420px]',
                )}
            >
                <aside className="w-full border-b border-slate-200 bg-slate-950 px-4 py-4 text-white lg:min-h-screen lg:border-r lg:border-b-0 lg:px-3 lg:py-5 xl:px-5 xl:py-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <img
                                    src="/GrahaMesran-light.png"
                                    alt="Graha Motor"
                                    className="h-9 w-9 object-contain"
                                />
                            </div>
                            <div>
                                <div
                                    className={cx(
                                        'text-sm font-black tracking-[0.2em] text-slate-300 uppercase',
                                        sidebarCollapsed
                                            ? 'hidden'
                                            : 'hidden xl:block',
                                    )}
                                >
                                    Graha Motor
                                </div>
                                <div
                                    className={cx(
                                        'mt-1 text-lg font-black',
                                        sidebarCollapsed
                                            ? 'hidden'
                                            : 'hidden xl:block',
                                    )}
                                >
                                    Kasir POS
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={item.onClick}
                                className={cx(
                                    'flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-200 lg:w-full lg:justify-center lg:px-0',
                                    !sidebarCollapsed &&
                                        'xl:justify-start xl:px-4',
                                    activeMenu === item.id
                                        ? 'bg-white text-slate-950'
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white',
                                )}
                            >
                                <item.icon />
                                <span
                                    className={cx(
                                        'whitespace-nowrap lg:hidden',
                                        !sidebarCollapsed && 'xl:inline',
                                    )}
                                >
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {!sidebarCollapsed && (
                        <>
                            <div className="mt-5 rounded-3xl bg-white/5 p-4 lg:mt-8">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Status Kasir
                                </div>
                                <div className="mt-3 text-lg font-black lg:text-center xl:text-left">
                                    {hasOpenSession
                                        ? 'Sesi Aktif'
                                        : 'Belum Dibuka'}
                                </div>
                                <div className="mt-1 text-sm text-slate-300 lg:hidden xl:block">
                                    {hasOpenSession
                                        ? `Dibuka ${formatDateTime(sessionState?.opened_at)}`
                                        : 'Masukkan saldo awal sebelum transaksi.'}
                                </div>

                                <button
                                    onClick={() =>
                                        hasOpenSession
                                            ? setShowSettlementModal(true)
                                            : setShowOpenSessionModal(true)
                                    }
                                    className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                                >
                                    <span className="lg:hidden xl:inline">
                                        {hasOpenSession
                                            ? 'Settlement / Tutup Kasir'
                                            : 'Buka Kasir'}
                                    </span>
                                    <span className="hidden lg:inline xl:hidden">
                                        {hasOpenSession ? 'Tutup' : 'Buka'}
                                    </span>
                                </button>
                            </div>

                            <div className="mt-5 rounded-3xl border border-white/10 p-4 lg:mt-8">
                                <div className="text-sm font-black">
                                    {auth?.user?.name}
                                </div>
                                <div className="mt-1 text-sm text-slate-400">
                                    Kasir aktif
                                </div>
                                <div className="mt-4 hidden text-xs font-semibold text-slate-400 xl:block">
                                    {STORE_CONFIG.address}
                                </div>
                                <div className="hidden text-xs font-semibold text-slate-400 xl:block">
                                    {STORE_CONFIG.phone}
                                </div>
                            </div>
                        </>
                    )}
                </aside>

                <main className="contents">
                    <section className="space-y-5 p-4 pb-28 sm:p-5 sm:pb-32 lg:col-start-2 lg:p-5 lg:pb-5 xl:p-6 xl:pb-6">
                        <div className="hidden lg:block">
                            <button
                                onClick={() =>
                                    setSidebarCollapsed((current) => !current)
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                                title={
                                    sidebarCollapsed
                                        ? 'Buka sidebar'
                                        : 'Tutup sidebar'
                                }
                            >
                                {sidebarCollapsed ? (
                                    <Icons.ChevronRight />
                                ) : (
                                    <Icons.ChevronLeft />
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
                                        className={cx(
                                            'rounded-2xl px-4 py-2 text-sm font-black shadow-sm transition-all duration-200 hover:shadow-md',
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
                                        className={cx(
                                            'rounded-2xl px-4 py-2 text-sm font-black shadow-sm transition-all duration-200 hover:shadow-md',
                                            isWorkshop
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-amber-50 text-amber-700',
                                        )}
                                    >
                                        Bengkel
                                    </button>
                                </div>

                                <div className="text-sm font-semibold text-slate-500">
                                    {filteredProducts.length} produk tampil
                                </div>
                            </div>

                            <div
                                className={cx(
                                    'mt-5 flex items-center gap-3 rounded-3xl px-4 py-3',
                                    formSurface,
                                )}
                            >
                                <div className="text-slate-400">
                                    <Icons.Search />
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

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Saldo Awal
                                </div>
                                <div className="mt-2 text-xl font-black text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.opening_cash || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Cash Masuk
                                </div>
                                <div className="mt-2 text-xl font-black text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.cash_sales_total || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Non Cash
                                </div>
                                <div className="mt-2 text-xl font-black text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.non_cash_sales_total || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-sm">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Expected Cash
                                </div>
                                <div className="mt-2 text-xl font-black">
                                    Rp {formatRupiah(expectedCash)}
                                </div>
                            </div>
                        </div>

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
                                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                    <div className="text-lg font-black text-slate-900">
                                        Produk tidak ditemukan
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-slate-500">
                                        Coba kata kunci lain atau kosongkan
                                        pencarian.
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section
                        className={cx(
                            'space-y-5 border-t border-slate-200 bg-slate-100 p-4 pb-28 sm:p-5 sm:pb-32 lg:col-start-3 lg:border-t-0 lg:border-l lg:p-5 lg:pb-5 xl:p-6 xl:pb-6',
                            !showMobileCheckout && 'hidden lg:block',
                        )}
                    >
                        <div className="rounded-[2rem] bg-white p-5 shadow-sm lg:sticky lg:top-5 xl:top-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                                        Keranjang
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-slate-950">
                                        {data.cart.length} item
                                    </div>
                                </div>
                                <button
                                    onClick={clearCart}
                                    className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-black text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 hover:shadow-md"
                                >
                                    Hapus Semua
                                </button>
                            </div>

                            <div className="mt-5 max-h-[300px] space-y-3 overflow-y-auto pr-1 xl:max-h-[360px]">
                                {data.cart.length === 0 && (
                                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                                        <div className="text-base font-black text-slate-900">
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
                                                        <div className="line-clamp-2 text-sm font-black text-slate-900">
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
                                                    className="rounded-2xl p-2 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Icons.Trash />
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
                                                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                                    >
                                                        <Icons.Minus />
                                                    </button>
                                                    <div className="min-w-[48px] text-center text-lg font-black text-slate-900">
                                                        {item.qty}
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                                    >
                                                        <Icons.Plus />
                                                    </button>
                                                </div>
                                                <div className="text-lg font-black text-slate-950">
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
                            <div className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                                Pembayaran
                            </div>

                            <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
                                <div className="text-sm font-semibold text-slate-400">
                                    Total tagihan
                                </div>
                                <div className="mt-2 text-3xl font-black">
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
                                        className={cx(
                                            'rounded-2xl px-3 py-3 text-sm font-black shadow-sm transition-all duration-200 hover:shadow-md',
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
                                    <label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                        Uang Diterima
                                    </label>
                                    <div
                                        className={cx(
                                            'mt-2 flex items-center rounded-2xl px-4 py-3',
                                            formSurface,
                                        )}
                                    >
                                        <span className="text-lg font-black text-slate-500">
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
                                            className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-black text-slate-950 focus:ring-0 focus:outline-none"
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
                                                    className={cx(
                                                        'rounded-2xl border px-3 py-3 text-left text-sm font-black shadow-sm transition-all duration-200 hover:shadow-md',
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
                                                            <div className="text-[10px] font-black tracking-widest uppercase opacity-70">
                                                                Uang Pas
                                                            </div>
                                                            <div className="text-sm font-black">
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
                                        className={cx(
                                            'mt-3 text-sm font-black',
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
                                    <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                        Mode Harga
                                    </div>
                                    <div className="mt-2 font-black text-slate-950">
                                        {isWorkshop ? 'Bengkel' : 'Umum'}
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                        Status Sesi
                                    </div>
                                    <div className="mt-2 font-black text-slate-950">
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
                                className="mt-5 w-full rounded-3xl bg-slate-950 px-4 py-4 text-base font-black text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isProcessing
                                    ? 'Memproses...'
                                    : 'Selesaikan Transaksi'}
                            </button>

                            <button
                                onClick={() => setShowMobileCheckout(false)}
                                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md lg:hidden"
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
                        <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                            Checkout Mobile
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                                {data.cart.length} item di keranjang
                            </span>
                            <span className="text-lg font-black">
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
                        className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                    >
                        {hasOpenSession ? 'Tutup' : 'Buka'}
                    </button>
                </div>
            </div>

            {!hasOpenSession && showOpenSessionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
                        <div className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                            Buka Kasir
                        </div>
                        <div className="mt-2 text-2xl font-black text-slate-950">
                            Masukkan uang awal di laci
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-500">
                            Nilai ini akan menjadi dasar expected cash saat
                            settlement nanti.
                        </div>

                        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                            {/* CASH AWAL */}
                            <label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                Cash Awal
                            </label>

                            <div
                                className={cx(
                                    'mt-2 flex items-center rounded-2xl px-4 py-3',
                                    formSurface,
                                )}
                            >
                                <span className="text-lg font-black text-slate-500">
                                    Rp
                                </span>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={openingCash}
                                    onChange={(event) =>
                                        setOpeningCash(
                                            sanitizeNumericInput(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                    placeholder="0"
                                    className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-black text-slate-950 focus:ring-0 focus:outline-none"
                                />
                            </div>

                            {/* CATATAN */}
                            <label className="mt-4 block text-xs font-black tracking-widest text-slate-400 uppercase">
                                Catatan Awal
                            </label>

                            <textarea
                                rows={3}
                                value={openingNotes}
                                onChange={(event) =>
                                    setOpeningNotes(event.target.value)
                                }
                                placeholder="Opsional"
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-0 focus:outline-none"
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex-1 rounded-3xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                            >
                                Keluar
                            </Link>
                            <button
                                onClick={handleOpenSession}
                                disabled={isOpeningSession}
                                className="flex-[1.2] rounded-3xl bg-slate-950 py-4 text-sm font-black text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:opacity-40"
                            >
                                {isOpeningSession ? 'Membuka...' : 'Buka Kasir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSettlementModal && hasOpenSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                                    Settlement
                                </div>
                                <div className="mt-2 text-2xl font-black text-slate-950">
                                    Tutup kasir dan cocokkan uang fisik
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettlementModal(false)}
                                className="rounded-2xl bg-slate-100 p-2 text-slate-500"
                            >
                                <Icons.Close />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-4">
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Saldo Awal
                                </div>
                                <div className="mt-2 text-xl font-black text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.opening_cash || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Cash Sales
                                </div>
                                <div className="mt-2 text-xl font-black text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.cash_sales_total || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-4">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Non Cash
                                </div>
                                <div className="mt-2 text-xl font-black text-slate-950">
                                    Rp{' '}
                                    {formatRupiah(
                                        sessionState?.non_cash_sales_total || 0,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950 p-4 text-white">
                                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                    Expected Cash
                                </div>
                                <div className="mt-2 text-xl font-black">
                                    Rp {formatRupiah(expectedCash)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-3xl bg-slate-50 p-5">
                                <label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Uang Fisik Di Laci
                                </label>
                                <div
                                    className={cx(
                                        'mt-2 flex items-center rounded-2xl px-4 py-3',
                                        formSurface,
                                    )}
                                >
                                    <span className="text-lg font-black text-slate-500">
                                        Rp
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={closingCashPhysical}
                                        onChange={(event) =>
                                            setClosingCashPhysical(
                                                sanitizeNumericInput(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="0"
                                        className="ml-3 w-full border-0 bg-transparent p-0 text-2xl font-black text-slate-950 focus:ring-0 focus:outline-none"
                                    />
                                </div>

                                <label className="mt-4 block text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Catatan Settlement
                                </label>
                                <textarea
                                    rows={4}
                                    value={closingNotes}
                                    onChange={(event) =>
                                        setClosingNotes(event.target.value)
                                    }
                                    placeholder="Opsional"
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-0 focus:outline-none"
                                />
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-5">
                                <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Hasil Settlement
                                </div>
                                <div
                                    className={cx(
                                        'mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase',
                                        settlementStatus === 'balance'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : settlementStatus === 'minus'
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-amber-100 text-amber-700',
                                    )}
                                >
                                    {settlementStatus === 'balance'
                                        ? 'Balance'
                                        : settlementStatus === 'minus'
                                          ? 'Minus'
                                          : 'Lebih'}
                                </div>

                                <div
                                    className={cx(
                                        'mt-4 text-3xl font-black',
                                        settlementStatus === 'balance'
                                            ? 'text-emerald-700'
                                            : settlementStatus === 'minus'
                                              ? 'text-red-700'
                                              : 'text-amber-700',
                                    )}
                                >
                                    {formatSignedCurrency(settlementDifference)}
                                </div>

                                <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
                                    <div className="flex items-center justify-between">
                                        <span>Expected cash</span>
                                        <span className="font-black text-slate-950">
                                            Rp {formatRupiah(expectedCash)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Uang fisik</span>
                                        <span className="font-black text-slate-950">
                                            Rp{' '}
                                            {formatRupiah(
                                                Number(
                                                    closingCashPhysical || 0,
                                                ),
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Total transaksi</span>
                                        <span className="font-black text-slate-950">
                                            {sessionState?.transactions_count ||
                                                0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowSettlementModal(false)}
                                className="flex-1 rounded-3xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleCloseSession}
                                disabled={isClosingSession}
                                className="flex-[1.2] rounded-3xl bg-slate-950 py-4 text-sm font-black text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md disabled:opacity-40"
                            >
                                {isClosingSession
                                    ? 'Menyimpan...'
                                    : 'Simpan Settlement & Tutup Kasir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
                        <div className="text-xl font-black text-slate-950">
                            Keluar dari kasir?
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-500">
                            Gunakan logout hanya jika tidak ada sesi kasir yang
                            sedang aktif.
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 rounded-3xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                            >
                                Batal
                            </button>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex-1 rounded-3xl bg-slate-950 py-4 text-sm font-black text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
                            >
                                Ya, Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            )}

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
