// @ts-nocheck
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { route } from 'ziggy-js';

// --- KONFIGURASI TOKO ---
const STORE_CONFIG = {
    name: 'GRAHA MESRAN',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
    bank: {
        name: 'BCA',
        number: '3537001405',
        holder: 'ARYA AJISADDA HARYANTO',
    },
    qrisUrl: 'assets/img/qris.jpg',
};

// --- small helper ---
const cx = (...arr) => arr.filter(Boolean).join(' ');
const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num);

// --- ICONS ---
const Icons = {
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    ),
    Scan: () => (
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
                d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
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
    Cash: () => (
        <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    ),
    Qris: () => (
        <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
        </svg>
    ),
    Card: () => (
        <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
        </svg>
    ),
    Box: () => (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
        </svg>
    ),
    Cart: () => (
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
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
    Back: () => (
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
        </svg>
    ),
    Copy: () => (
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
        </svg>
    ),
    Check: () => (
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
                d="M5 13l4 4L19 7"
            />
        </svg>
    ),
    Tag: () => (
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 011 12V7a4 4 0 014-4z"
            />
        </svg>
    ),
};

// --- COMPONENT: PRODUCT CARD ---
const ProductCard = ({ product, onAdd, customerType }) => {
    const isOutOfStock = (Number(product.stock) || 0) <= 0;
    const stockNum = Number(product.stock) || 0;
    const isLowStock = stockNum > 0 && stockNum <= 5;

    const sellPrice = parseFloat(product.sell_price) || 0;
    const workshopPrice = parseFloat(product.workshop_price) || 0;

    const activePrice =
        customerType === 'workshop' && workshopPrice > 0
            ? workshopPrice
            : sellPrice;

    return (
        <button
            type="button"
            onClick={() => !isOutOfStock && onAdd(product)}
            className={cx(
                'group relative flex w-full flex-col justify-between rounded-2xl border p-4 text-left shadow-sm transition',
                'bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70',
                'focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:outline-none',
                isOutOfStock
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50 grayscale'
                    : 'border-slate-200 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.99]',
            )}
        >
            {/* top meta */}
            <div className="mb-3 flex items-start justify-between gap-2">
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold tracking-wide text-slate-600">
                    {product.sku || 'NOSKU'}
                </span>

                <span
                    className={cx(
                        'inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold',
                        isOutOfStock
                            ? 'bg-red-100 text-red-600'
                            : isLowStock
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-emerald-100 text-emerald-700',
                    )}
                >
                    {isOutOfStock
                        ? 'HABIS'
                        : isLowStock
                          ? `SISA: ${stockNum}`
                          : `STOK: ${stockNum}`}
                </span>
            </div>

            {/* name + vehicles */}
            <div className="flex-1">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-black text-slate-900">
                    {product.name}
                </h3>

                {product.vehicles?.length > 0 && (
                    <div className="mt-2 inline-flex max-w-full items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        <Icons.Box />
                        <span className="truncate">
                            {product.vehicles.map((v) => v.model).join(', ')}
                        </span>
                    </div>
                )}
            </div>

            {/* price */}
            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                <div className="space-y-1">
                    {customerType === 'workshop' && workshopPrice > 0 && (
                        <div className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-700">
                            <Icons.Tag />
                            Harga Bengkel
                        </div>
                    )}
                    <div className="text-[11px] font-semibold text-slate-400">
                        Harga
                    </div>
                </div>

                <div
                    className={cx(
                        'text-base font-black tracking-tight',
                        customerType === 'workshop'
                            ? 'text-orange-600'
                            : 'text-slate-900',
                    )}
                >
                    Rp {formatRupiah(activePrice)}
                </div>
            </div>

            {/* subtle hover accent */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-slate-200" />
        </button>
    );
};

// --- COMPONENT: NUMPAD ---
const Numpad = ({ onInput, onClear, onBackspace }) => {
    const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'];
    return (
        <div className="grid h-full grid-cols-3 gap-3">
            {buttons.map((btn) => (
                <button
                    key={btn}
                    onClick={() => {
                        if (btn === 'C') onClear();
                        else if (btn === '⌫') onBackspace();
                        else onInput(btn);
                    }}
                    className={cx(
                        'flex min-h-[58px] items-center justify-center rounded-2xl text-2xl font-black shadow-sm transition active:scale-[0.98]',
                        typeof btn === 'number'
                            ? 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                    )}
                >
                    {btn}
                </button>
            ))}
        </div>
    );
};

export default function TabletPOS({ products }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');

    // --- STATES ---
    const [customerType, setCustomerType] = useState('general'); // 'general' or 'workshop'
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [change, setChange] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const { data, setData, reset } = useForm({ cart: [] });

    const isWorkshop = customerType === 'workshop';

    // --- PERF: INDEX PRODUCTS BY ID ---
    const productById = useMemo(() => {
        const m = new Map();
        for (const p of products) m.set(p.id, p);
        return m;
    }, [products]);

    // --- HELPER: ACTIVE PRICE ---
    const getProductPrice = useCallback(
        (product) => {
            const sellPrice = parseFloat(product?.sell_price) || 0;
            const workshopPrice = parseFloat(product?.workshop_price) || 0;
            if (customerType === 'workshop' && workshopPrice > 0)
                return workshopPrice;
            return sellPrice;
        },
        [customerType],
    );

    // --- PERF: SEARCH (SMOOTHER) + LIMIT 30 ---
    const deferredSearch = useDeferredValue(search);

    const filteredProducts = useMemo(() => {
        const q = deferredSearch.trim().toLowerCase();
        const base = !q
            ? products
            : products.filter(
                  (p) =>
                      p.name.toLowerCase().includes(q) ||
                      (p.sku || '').toLowerCase().includes(q) ||
                      (p.vehicles?.some((v) =>
                          (v.model || '').toLowerCase().includes(q),
                      ) ??
                          false),
              );
        return base.slice(0, 30);
    }, [products, deferredSearch]);

    // --- PERF: TOTAL AMOUNT WITHOUT REPEATED find() ---
    const totalAmount = useMemo(() => {
        return data.cart.reduce((sum, item) => {
            const product = productById.get(item.id);
            const sellPrice =
                parseFloat(product?.sell_price ?? item.sell_price) || 0;
            const workshopPrice = parseFloat(product?.workshop_price ?? 0) || 0;

            const price =
                customerType === 'workshop' && workshopPrice > 0
                    ? workshopPrice
                    : sellPrice;
            return sum + price * (Number(item.qty) || 0);
        }, 0);
    }, [data.cart, productById, customerType]);

    useEffect(() => {
        if (paymentMethod === 'cash') {
            const received = parseInt(cashReceived) || 0;
            setChange(received - totalAmount);
        } else {
            setChange(0);
        }
    }, [cashReceived, totalAmount, paymentMethod]);

    // --- ACTIONS ---
    const addToCart = useCallback(
        (product) => {
            const existing = data.cart.find((item) => item.id === product.id);
            const stock = Number(product.stock) || 0;

            if (existing && (Number(existing.qty) || 0) + 1 > stock) {
                alert(`Stok tidak cukup! Sisa: ${stock}`);
                return;
            }
            if (navigator.vibrate) navigator.vibrate(30);

            if (existing) {
                setData(
                    'cart',
                    data.cart.map((item) =>
                        item.id === product.id
                            ? { ...item, qty: (Number(item.qty) || 0) + 1 }
                            : item,
                    ),
                );
            } else {
                setData('cart', [...data.cart, { ...product, qty: 1 }]);
            }
        },
        [data.cart, setData],
    );

    const updateQty = useCallback(
        (id, delta) => {
            setData(
                'cart',
                data.cart.map((item) => {
                    if (item.id !== id) return item;

                    const stock = Number(productById.get(id)?.stock || 0);
                    const currentQty = Number(item.qty) || 1;
                    const newQty = Math.max(1, currentQty + delta);

                    if (newQty > stock) {
                        alert('Mencapai batas stok tersedia');
                        return item;
                    }
                    return { ...item, qty: newQty };
                }),
            );
        },
        [data.cart, productById, setData],
    );

    const handleManualQtyChange = useCallback(
        (id, value) => {
            if (value === '') {
                setData(
                    'cart',
                    data.cart.map((item) =>
                        item.id === id ? { ...item, qty: '' } : item,
                    ),
                );
                return;
            }

            const stock = Number(productById.get(id)?.stock || 0);
            let newQty = parseInt(value);
            if (isNaN(newQty)) newQty = 1;

            if (newQty > stock) {
                alert(`Stok maksimal hanya ${stock}`);
                newQty = stock;
            }

            setData(
                'cart',
                data.cart.map((item) =>
                    item.id === id ? { ...item, qty: newQty } : item,
                ),
            );
        },
        [data.cart, productById, setData],
    );

    const handleManualQtyBlur = useCallback(
        (id, value) => {
            if (value === '' || parseInt(value) <= 0) {
                setData(
                    'cart',
                    data.cart.map((item) =>
                        item.id === id ? { ...item, qty: 1 } : item,
                    ),
                );
            }
        },
        [data.cart, setData],
    );

    const removeItem = useCallback(
        (id) => {
            const newCart = data.cart.filter((item) => item.id !== id);
            setData('cart', newCart);
            if (newCart.length === 0) setShowCartMobile(false);
        },
        [data.cart, setData],
    );

    const clearCart = useCallback(() => {
        if (data.cart.length === 0) return;
        setData('cart', []);
    }, [data.cart.length, setData]);

    const handleNumpadInput = useCallback(
        (num) => setCashReceived((prev) => prev + num.toString()),
        [],
    );
    const handleNumpadClear = useCallback(() => setCashReceived(''), []);
    const handleNumpadBackspace = useCallback(
        () => setCashReceived((prev) => prev.slice(0, -1)),
        [],
    );

    const copyToClipboard = useCallback((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, []);

    // Tailwind-safe styles (no dynamic border-${color})
    const payStyle = useMemo(
        () => ({
            cash: {
                border: 'border-emerald-500',
                ring: 'ring-emerald-200',
                iconBg: 'bg-emerald-100',
                iconText: 'text-emerald-700',
            },
            qris: {
                border: 'border-slate-500',
                ring: 'ring-slate-200',
                iconBg: 'bg-slate-100',
                iconText: 'text-slate-700',
            },
            bank: {
                border: 'border-blue-500',
                ring: 'ring-blue-200',
                iconBg: 'bg-blue-100',
                iconText: 'text-blue-700',
            },
        }),
        [],
    );

    const processPayment = useCallback(() => {
        const finalPaid =
            paymentMethod === 'cash'
                ? parseInt(cashReceived) || 0
                : totalAmount;

        if (paymentMethod === 'cash' && finalPaid < totalAmount) {
            alert('Uang pembayaran kurang!');
            return;
        }

        setIsProcessing(true);

        const finalChange =
            paymentMethod === 'cash' ? finalPaid - totalAmount : 0;

        const finalCart = data.cart.map((item) => {
            const product = productById.get(item.id);
            return { ...item, sell_price: getProductPrice(product) };
        });

        const payload = {
            cart: finalCart,
            payment_method: paymentMethod,
            amount_paid: finalPaid,
            change_amount: finalChange,
            customer_type: customerType,
        };

        router.post(route('transactions.store'), payload, {
            onSuccess: () => {
                const newReceipt = {
                    invoice: 'INV-' + Math.floor(Date.now() / 1000),
                    date: new Date().toLocaleString('id-ID'),
                    items: finalCart,
                    total: totalAmount,
                    payAmount: finalPaid,
                    change: finalChange,
                    paymentMethod: paymentMethod.toUpperCase(),
                    cashier: auth.user.name,
                    customerType:
                        customerType === 'workshop' ? 'BENGKEL' : 'UMUM',
                };
                setReceiptData(newReceipt);
                setPaymentOpen(false);
                setShowCartMobile(false);

                setTimeout(() => {
                    window.print();
                    reset();
                    setSearch('');
                    setCashReceived('');
                    setCustomerType('general');
                }, 450);
            },
            onError: (errors) => {
                console.error('Error Log:', errors);
                let errorMsg = 'Gagal memproses transaksi:\n';
                Object.keys(errors).forEach((key) => {
                    errorMsg += `- ${errors[key]}\n`;
                });
                alert(errorMsg);
                setIsProcessing(false);
            },
            onFinish: () => setIsProcessing(false),
        });
    }, [
        paymentMethod,
        cashReceived,
        totalAmount,
        data.cart,
        productById,
        getProductPrice,
        customerType,
        auth?.user?.name,
        reset,
    ]);

    // --- STATE SCANNER ---
    const [scanToast, setScanToast] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const lastScannedRef = useRef(null);
    const scannerRef = useRef(null);
    const scanCallbackRef = useRef(null);

    const beepAudio = useRef(
        typeof Audio !== 'undefined'
            ? new Audio('/assets/audio/beep.mp3')
            : null,
    );

    const playBeep = () => {
        if (beepAudio.current) {
            beepAudio.current.currentTime = 0;
            beepAudio.current
                .play()
                .catch((e) => console.log('Audio play failed', e));
        }
    };

    const onScanSuccess = useCallback(
        (decodedText) => {
            const scannedOriginal = String(decodedText).trim().toUpperCase();
            if (lastScannedRef.current === scannedOriginal) return;
            lastScannedRef.current = scannedOriginal;

            const scannedNoZero = scannedOriginal.replace(/^0+/, '');

            const product = products.find((p) => {
                const skuDb = String(p.sku || '')
                    .trim()
                    .toUpperCase();
                return skuDb === scannedOriginal || skuDb === scannedNoZero;
            });

            if (product) {
                playBeep();
                addToCart(product);
                setScanToast(`Berhasil: ${product.name}`);
                setTimeout(() => setScanToast(null), 1800);

                if (navigator.vibrate) navigator.vibrate(50);
                setTimeout(() => {
                    lastScannedRef.current = null;
                }, 1200);
            } else {
                playBeep();
                setScanToast(`❌ Barang tidak ditemukan: ${scannedOriginal}`);
                setTimeout(() => setScanToast(null), 2600);

                setTimeout(() => {
                    lastScannedRef.current = null;
                }, 1600);
            }
        },
        [products, addToCart],
    );

    useEffect(() => {
        scanCallbackRef.current = onScanSuccess;
    }, [onScanSuccess]);

    useEffect(() => {
        let isMounted = true;

        if (isScannerOpen) {
            const timer = setTimeout(() => {
                if (!isMounted) return;
                if (!document.getElementById('reader')) return;
                if (scannerRef.current) return;

                const html5QrCode = new Html5Qrcode('reader', false);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdgePercentage = 0.72;
                        const minDim = Math.min(
                            viewfinderWidth,
                            viewfinderHeight,
                        );
                        return {
                            width: minDim * minEdgePercentage,
                            height: minDim * minEdgePercentage,
                        };
                    },
                };

                html5QrCode
                    .start(
                        { facingMode: 'environment' },
                        config,
                        (decodedText) => {
                            if (scanCallbackRef.current)
                                scanCallbackRef.current(decodedText);
                        },
                    )
                    .catch((err) => {
                        console.error('Kamera Error:', err);
                        let errorMsg = 'Gagal start kamera.';
                        if (
                            location.protocol !== 'https:' &&
                            location.hostname !== 'localhost'
                        ) {
                            errorMsg = 'Wajib HTTPS/Localhost!';
                        }
                        if (isMounted) {
                            alert(errorMsg);
                            setIsScannerOpen(false);
                        }
                    });
            }, 350);

            return () => clearTimeout(timer);
        } else {
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        scannerRef.current.clear();
                        scannerRef.current = null;
                    })
                    .catch(() => {
                        scannerRef.current = null;
                    });
            }
        }

        return () => {
            isMounted = false;
        };
    }, [isScannerOpen]);

    // --- accents ---
    const accentBg = isWorkshop ? 'bg-orange-600' : 'bg-blue-600';
    const accentSoft = isWorkshop ? 'bg-orange-50' : 'bg-slate-50';
    const accentRing = isWorkshop
        ? 'focus:ring-orange-500'
        : 'focus:ring-blue-500';
    const accentText = isWorkshop ? 'text-orange-600' : 'text-blue-600';

    return (
        <div
            className={cx(
                'h-screen w-full overflow-hidden font-sans text-slate-900',
                isWorkshop ? 'bg-orange-50' : 'bg-slate-100',
            )}
        >
            <Head title="Kasir - Graha Mesran" />

            {/* --- TOP BAR (cleaner + premium) --- */}
            <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md print:hidden">
                <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4">
                    {/* brand */}
                    <div className="flex items-center gap-3">
                        {/* BAGIAN INI YANG DIUBAH: Ganti Icon Petir jadi Gambar Logo */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white p-1 shadow-lg">
                            <img
                                src="/GrahaMesran-light.png"
                                alt="Graha Mesran"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        {/* Bagian Teks (Tetap Sama) */}
                        <div className="hidden sm:block">
                            <div className="text-sm leading-tight font-black">
                                {STORE_CONFIG.name}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500">
                                {auth?.user?.name}
                            </div>
                        </div>
                    </div>

                    {/* search */}
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Icons.Search />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Barang / SKU / Motor..."
                                className={cx(
                                    'w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm font-bold text-slate-900 shadow-sm',
                                    'placeholder:text-slate-400 focus:border-transparent focus:ring-2',
                                    accentRing,
                                )}
                            />
                            {search?.length > 0 && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-2 my-auto rounded-xl px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <Icons.Close />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className={cx(
                                'hidden items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition active:scale-[0.99] md:flex',
                                isWorkshop
                                    ? 'bg-orange-700 hover:bg-orange-800'
                                    : 'bg-slate-900 hover:bg-black',
                            )}
                        >
                            <Icons.Scan />
                            Scan
                        </button>
                    </div>

                    {/* mode */}
                    <div className="hidden rounded-2xl bg-slate-100 p-1 md:flex">
                        <button
                            onClick={() => setCustomerType('general')}
                            className={cx(
                                'rounded-2xl px-4 py-2 text-xs font-black transition',
                                !isWorkshop
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800',
                            )}
                        >
                            UMUM
                        </button>
                        <button
                            onClick={() => setCustomerType('workshop')}
                            className={cx(
                                'flex items-center gap-1 rounded-2xl px-4 py-2 text-xs font-black transition',
                                isWorkshop
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800',
                            )}
                        >
                            <Icons.Tag />
                            BENGKEL
                        </button>
                    </div>

                    {/* actions */}
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className={cx(
                            'flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:hidden',
                            'active:scale-[0.99]',
                        )}
                    >
                        <Icons.Scan />
                    </button>

                    <button
                        onClick={() => setShowCartMobile(!showCartMobile)}
                        className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm active:scale-[0.99] lg:hidden"
                    >
                        <Icons.Cart />
                        {data.cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                                {data.cart.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="rounded-2xl p-3 text-red-500 transition hover:bg-red-50 active:scale-[0.99]"
                        title="Keluar"
                    >
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </button>
                </div>

                {/* mobile mode toggle */}
                <div className="mx-auto flex max-w-[1600px] gap-2 px-4 pb-3 md:hidden">
                    <button
                        onClick={() => setCustomerType('general')}
                        className={cx(
                            'flex-1 rounded-2xl border px-4 py-2 text-xs font-black',
                            !isWorkshop
                                ? 'border-slate-300 bg-white text-slate-900 shadow-sm'
                                : 'border-slate-200 bg-slate-50 text-slate-600',
                        )}
                    >
                        UMUM
                    </button>
                    <button
                        onClick={() => setCustomerType('workshop')}
                        className={cx(
                            'flex flex-1 items-center justify-center gap-1 rounded-2xl border px-4 py-2 text-xs font-black',
                            isWorkshop
                                ? 'border-orange-300 bg-orange-600 text-white shadow-sm'
                                : 'border-slate-200 bg-slate-50 text-slate-600',
                        )}
                    >
                        <Icons.Tag />
                        BENGKEL
                    </button>
                </div>
            </div>

            {/* --- MAIN SHELL --- */}
            <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1600px] overflow-hidden print:hidden">
                {/* PRODUCTS */}
                <div
                    className={cx(
                        'flex-1 overflow-y-auto p-4 md:p-6',
                        isWorkshop ? 'bg-orange-50' : 'bg-slate-100',
                    )}
                >
                    {/* subtle header row */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-black text-slate-900">
                            Produk
                            {deferredSearch?.trim() && (
                                <span className="ml-2 text-xs font-semibold text-slate-500">
                                    ({filteredProducts.length} hasil • max 30)
                                </span>
                            )}
                        </div>
                        <div
                            className={cx(
                                'rounded-2xl px-3 py-1 text-xs font-black',
                                isWorkshop
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-slate-200 text-slate-700',
                            )}
                        >
                            {isWorkshop ? 'MODE: HARGA BENGKEL' : 'MODE: UMUM'}
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="flex h-[60vh] flex-col items-center justify-center text-slate-400">
                            <Icons.Search />
                            <p className="mt-3 text-sm font-bold">
                                Barang tidak ditemukan
                            </p>
                            <p className="mt-1 text-xs">
                                Coba cari pakai SKU atau model motor.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pb-28 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAdd={addToCart}
                                    customerType={customerType}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* CART (desktop) */}
                <div className="relative hidden w-[420px] shrink-0 border-l border-slate-200 bg-white lg:flex lg:flex-col">
                    {/* cart header */}
                    <div
                        className={cx(
                            'border-b p-5',
                            isWorkshop
                                ? 'border-orange-100 bg-orange-50/40'
                                : 'border-slate-100 bg-slate-50/50',
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-lg font-black text-slate-900">
                                    Keranjang
                                </div>
                                <div className="mt-1 text-xs font-semibold text-slate-500">
                                    {data.cart.length} item •{' '}
                                    {isWorkshop ? (
                                        <span
                                            className={cx(
                                                'font-black',
                                                accentText,
                                            )}
                                        >
                                            harga bengkel aktif
                                        </span>
                                    ) : (
                                        'siap dibayar'
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={clearCart}
                                className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 active:scale-[0.99]"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>

                    {/* cart list */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {data.cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-slate-300">
                                <Icons.Cart />
                                <p className="mt-3 text-sm font-bold">
                                    Keranjang Kosong
                                </p>
                                <p className="mt-1 text-xs">
                                    Tap produk untuk menambahkan.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.cart.map((item, idx) => {
                                    const product = productById.get(item.id);
                                    const currentPrice = product
                                        ? getProductPrice(product)
                                        : parseFloat(item.sell_price) || 0;
                                    const displayQty =
                                        item.qty === '' ? '' : item.qty;

                                    return (
                                        <div
                                            key={idx}
                                            className={cx(
                                                'rounded-2xl border p-4 shadow-sm',
                                                isWorkshop
                                                    ? 'border-orange-100'
                                                    : 'border-slate-200',
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="line-clamp-2 text-sm font-black text-slate-900">
                                                        {item.name}
                                                    </div>
                                                    <div className="mt-1 text-xs font-semibold text-slate-500">
                                                        @ Rp{' '}
                                                        {formatRupiah(
                                                            currentPrice,
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="rounded-2xl p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.99]"
                                                    title="Hapus item"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-end justify-between">
                                                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                        disabled={
                                                            (Number(item.qty) ||
                                                                1) <= 1
                                                        }
                                                        className="flex h-11 w-12 items-center justify-center font-black text-slate-600 active:bg-slate-200 disabled:opacity-40"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className="h-11 w-14 border-0 bg-transparent p-0 text-center text-lg font-black text-slate-900 focus:ring-0"
                                                        value={displayQty}
                                                        onChange={(e) =>
                                                            handleManualQtyChange(
                                                                item.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={(e) =>
                                                            handleManualQtyBlur(
                                                                item.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                        className={cx(
                                                            'flex h-11 w-12 items-center justify-center font-black active:bg-blue-100',
                                                            accentText,
                                                        )}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div
                                                    className={cx(
                                                        'text-lg font-black tracking-tight',
                                                        isWorkshop
                                                            ? 'text-orange-600'
                                                            : 'text-slate-900',
                                                    )}
                                                >
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        currentPrice *
                                                            (Number(item.qty) ||
                                                                0),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* cart footer */}
                    <div className="border-t border-slate-100 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
                        <div className="flex items-end justify-between">
                            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Total
                            </div>
                            <div
                                className={cx(
                                    'text-3xl font-black tracking-tight',
                                    isWorkshop
                                        ? 'text-orange-600'
                                        : 'text-slate-900',
                                )}
                            >
                                Rp {formatRupiah(totalAmount)}
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                data.cart.length > 0 && setPaymentOpen(true)
                            }
                            disabled={data.cart.length === 0}
                            className={cx(
                                'mt-4 w-full rounded-2xl py-4 text-base font-black text-white shadow-xl transition active:scale-[0.99] disabled:opacity-50',
                                data.cart.length === 0
                                    ? 'bg-slate-300'
                                    : isWorkshop
                                      ? 'bg-orange-600 shadow-orange-600/25 hover:bg-orange-700'
                                      : 'bg-blue-600 shadow-blue-600/25 hover:bg-blue-700',
                            )}
                        >
                            Bayar Sekarang
                        </button>
                    </div>
                </div>

                {/* CART (mobile slide over) */}
                <div
                    className={cx(
                        'fixed inset-0 z-50 flex transform flex-col bg-white transition-transform duration-300 lg:hidden',
                        showCartMobile ? 'translate-x-0' : 'translate-x-full',
                    )}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
                        <div>
                            <div className="text-lg font-black">Keranjang</div>
                            <div className="text-xs font-semibold text-slate-500">
                                {data.cart.length} item
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCartMobile(false)}
                            className="rounded-2xl bg-slate-100 p-2 text-slate-600"
                        >
                            <Icons.Close />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {data.cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-slate-300">
                                <Icons.Cart />
                                <p className="mt-2 text-sm font-bold">
                                    Keranjang Kosong
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.cart.map((item, idx) => {
                                    const product = productById.get(item.id);
                                    const currentPrice = product
                                        ? getProductPrice(product)
                                        : parseFloat(item.sell_price) || 0;
                                    const displayQty =
                                        item.qty === '' ? '' : item.qty;

                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="line-clamp-2 text-sm font-black text-slate-900">
                                                        {item.name}
                                                    </div>
                                                    <div className="mt-1 text-xs font-semibold text-slate-500">
                                                        @ Rp{' '}
                                                        {formatRupiah(
                                                            currentPrice,
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="rounded-2xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>

                                            <div className="mt-3 flex items-end justify-between">
                                                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                        disabled={
                                                            (Number(item.qty) ||
                                                                1) <= 1
                                                        }
                                                        className="flex h-11 w-12 items-center justify-center font-black text-slate-600 active:bg-slate-200 disabled:opacity-40"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className="h-11 w-14 border-0 bg-transparent p-0 text-center text-lg font-black text-slate-900 focus:ring-0"
                                                        value={displayQty}
                                                        onChange={(e) =>
                                                            handleManualQtyChange(
                                                                item.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={(e) =>
                                                            handleManualQtyBlur(
                                                                item.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                        className={cx(
                                                            'flex h-11 w-12 items-center justify-center font-black active:bg-blue-100',
                                                            accentText,
                                                        )}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="text-lg font-black text-slate-900">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        currentPrice *
                                                            (Number(item.qty) ||
                                                                0),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
                        <div className="flex items-end justify-between">
                            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Total
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                                Rp {formatRupiah(totalAmount)}
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                data.cart.length > 0 && setPaymentOpen(true)
                            }
                            disabled={data.cart.length === 0}
                            className={cx(
                                'mt-4 w-full rounded-2xl py-4 text-base font-black text-white shadow-xl transition active:scale-[0.99] disabled:opacity-50',
                                data.cart.length === 0
                                    ? 'bg-slate-300'
                                    : isWorkshop
                                      ? 'bg-orange-600 hover:bg-orange-700'
                                      : 'bg-blue-600 hover:bg-blue-700',
                            )}
                        >
                            Bayar Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* --- PAYMENT MODAL --- */}
            {isPaymentOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-white md:flex-row print:hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 p-4 md:hidden">
                        <button
                            onClick={() => setPaymentOpen(false)}
                            className="flex items-center gap-2 text-sm font-black text-slate-600"
                        >
                            <Icons.Back /> Kembali
                        </button>
                        <h3 className="text-base font-black">Pembayaran</h3>
                    </div>

                    {/* left summary */}
                    <div className="w-full bg-slate-50 p-6 md:w-[420px] md:border-r md:border-slate-100 md:p-8">
                        <div className="hidden md:block">
                            <button
                                onClick={() => setPaymentOpen(false)}
                                className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-slate-900"
                            >
                                <Icons.Back /> Kembali
                            </button>
                        </div>

                        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Total Tagihan
                                </div>
                                {isWorkshop && (
                                    <div className="rounded-xl bg-orange-100 px-3 py-1 text-[10px] font-black text-orange-700">
                                        HARGA BENGKEL
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                                Rp {formatRupiah(totalAmount)}
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="text-sm font-black text-slate-700">
                                Metode Bayar
                            </div>

                            {[
                                {
                                    id: 'cash',
                                    label: 'Tunai',
                                    icon: Icons.Cash,
                                },
                                {
                                    id: 'qris',
                                    label: 'QRIS Scan',
                                    icon: Icons.Qris,
                                },
                                {
                                    id: 'bank',
                                    label: 'BCA Transfer',
                                    icon: Icons.Card,
                                },
                            ].map((m) => {
                                const s = payStyle[m.id];
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setPaymentMethod(m.id);
                                            setCashReceived('');
                                        }}
                                        className={cx(
                                            'flex w-full items-center rounded-3xl border-2 p-4 transition active:scale-[0.99]',
                                            paymentMethod === m.id
                                                ? `${s.border} bg-white shadow-md ring-1 ${s.ring}`
                                                : 'border-slate-200 bg-white hover:border-slate-300',
                                        )}
                                    >
                                        <div
                                            className={cx(
                                                'mr-4 rounded-2xl p-2',
                                                paymentMethod === m.id
                                                    ? `${s.iconBg} ${s.iconText}`
                                                    : 'bg-slate-100 text-slate-400',
                                            )}
                                        >
                                            <m.icon />
                                        </div>
                                        <div
                                            className={cx(
                                                'text-base font-black',
                                                paymentMethod === m.id
                                                    ? 'text-slate-900'
                                                    : 'text-slate-600',
                                            )}
                                        >
                                            {m.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* right content */}
                    <div className="flex flex-1 flex-col p-6 md:p-10">
                        {paymentMethod === 'cash' && (
                            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
                                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                        Uang Diterima
                                    </div>
                                    <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                                        {cashReceived ? (
                                            `Rp ${formatRupiah(parseInt(cashReceived))}`
                                        ) : (
                                            <span className="text-slate-300">
                                                Rp 0
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className={cx(
                                            'mt-4 inline-flex rounded-2xl px-4 py-2 text-sm font-black',
                                            change < 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-emerald-100 text-emerald-800',
                                        )}
                                    >
                                        {change < 0
                                            ? `Kurang: Rp ${formatRupiah(Math.abs(change))}`
                                            : `Kembali: Rp ${formatRupiah(change)}`}
                                    </div>
                                </div>

                                <div className="mb-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() =>
                                            setCashReceived(
                                                totalAmount.toString(),
                                            )
                                        }
                                        className="rounded-3xl bg-blue-50 py-3 text-sm font-black text-blue-800 active:bg-blue-100"
                                    >
                                        Uang Pas
                                    </button>
                                    <button
                                        onClick={() => setCashReceived('50000')}
                                        className="rounded-3xl bg-slate-50 py-3 text-sm font-black text-slate-800 active:bg-slate-200"
                                    >
                                        50.000
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCashReceived('100000')
                                        }
                                        className="rounded-3xl bg-slate-50 py-3 text-sm font-black text-slate-800 active:bg-slate-200"
                                    >
                                        100.000
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCashReceived(
                                                (
                                                    totalAmount +
                                                    (50000 -
                                                        (totalAmount % 50000))
                                                ).toString(),
                                            )
                                        }
                                        className="rounded-3xl bg-slate-50 py-3 text-sm font-black text-slate-800 active:bg-slate-200"
                                    >
                                        Next 50k
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <Numpad
                                        onInput={handleNumpadInput}
                                        onClear={handleNumpadClear}
                                        onBackspace={handleNumpadBackspace}
                                    />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'qris' && (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                                    <img
                                        src={STORE_CONFIG.qrisUrl}
                                        alt="QRIS Code"
                                        className="mx-auto h-64 w-64 rounded-2xl object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Pembayaran%20Graha%20Mesran%20Rp${totalAmount}`;
                                        }}
                                    />
                                    <div className="mt-3 text-base font-black text-slate-900">
                                        Scan QRIS
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500">
                                        NMID: GRAHA MESRAN
                                    </div>
                                </div>

                                <div className="mt-6 rounded-3xl bg-blue-50 px-6 py-4 text-blue-900">
                                    <div className="text-sm font-black">
                                        Menunggu Pembayaran…
                                    </div>
                                    <div className="mt-1 text-sm">
                                        Nominal:{' '}
                                        <span className="font-black">
                                            Rp {formatRupiah(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'bank' && (
                            <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
                                <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-900 p-6 text-white shadow-xl">
                                    <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/10" />
                                    <div className="flex items-start justify-between">
                                        <div className="text-2xl font-black italic">
                                            BCA
                                        </div>
                                        <div className="text-xs font-bold opacity-80">
                                            DEBIT / TF
                                        </div>
                                    </div>

                                    <div className="mt-8 text-left">
                                        <div className="text-xs font-black tracking-widest uppercase opacity-70">
                                            Nomor Rekening
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="font-mono text-3xl font-black tracking-widest">
                                                {STORE_CONFIG.bank.number}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        STORE_CONFIG.bank
                                                            .number,
                                                    )
                                                }
                                                className="rounded-2xl bg-white/20 p-2 backdrop-blur transition hover:bg-white/30 active:scale-[0.99]"
                                            >
                                                {copied ? (
                                                    <Icons.Check />
                                                ) : (
                                                    <Icons.Copy />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-white/20 pt-4 text-left">
                                        <div className="text-xs font-black tracking-widest uppercase opacity-70">
                                            Atas Nama
                                        </div>
                                        <div className="mt-1 truncate text-lg font-black">
                                            {STORE_CONFIG.bank.holder}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 w-full rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                        Transfer Total
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-slate-900">
                                        Rp {formatRupiah(totalAmount)}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={processPayment}
                            disabled={
                                isProcessing ||
                                (paymentMethod === 'cash' && change < 0)
                            }
                            className="mt-6 w-full rounded-3xl bg-slate-900 py-5 text-base font-black text-white shadow-xl shadow-slate-900/20 transition active:scale-[0.99] disabled:opacity-50"
                        >
                            {isProcessing
                                ? 'MEMPROSES...'
                                : 'SELESAI & CETAK STRUK'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- SCANNER MODAL --- */}
            {isScannerOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
                        <div className="flex items-center justify-between px-1 py-2">
                            <div className="text-base font-black text-slate-900">
                                Scan Barcode
                            </div>
                            <button
                                onClick={() => setIsScannerOpen(false)}
                                className="rounded-2xl bg-slate-100 p-2 text-slate-600 hover:bg-red-100 hover:text-red-600"
                            >
                                <Icons.Close />
                            </button>
                        </div>

                        {/* toast */}
                        {scanToast && (
                            <div
                                className={cx(
                                    'absolute top-16 right-4 left-4 z-10 rounded-2xl px-4 py-3 text-center text-sm font-black text-white shadow-lg',
                                    'animate-[toastIn_.18s_ease-out]',
                                    scanToast.includes('❌')
                                        ? 'bg-red-600'
                                        : 'bg-emerald-600',
                                )}
                            >
                                {scanToast}
                            </div>
                        )}

                        <style>{`
                          @keyframes toastIn {
                            from { transform: translateY(-8px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                          }
                        `}</style>

                        <div className="relative mt-3 overflow-hidden rounded-2xl bg-black">
                            <div
                                id="reader"
                                className="min-h-[320px] w-full bg-black"
                            />
                            {/* modern reticle */}
                            <div className="pointer-events-none absolute inset-0 grid place-items-center">
                                <div className="relative h-56 w-56 rounded-3xl border border-white/40">
                                    <div className="absolute top-0 left-0 h-5 w-5 rounded-tl-2xl border-t-4 border-l-4 border-white/80" />
                                    <div className="absolute top-0 right-0 h-5 w-5 rounded-tr-2xl border-t-4 border-r-4 border-white/80" />
                                    <div className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-2xl border-b-4 border-l-4 border-white/80" />
                                    <div className="absolute right-0 bottom-0 h-5 w-5 rounded-br-2xl border-r-4 border-b-4 border-white/80" />
                                    <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-rose-500/70 shadow-[0_0_18px_rgba(244,63,94,0.8)]" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm font-semibold text-slate-500">
                            Arahkan kamera ke barcode. <br />
                            Otomatis lanjut scan barang berikutnya.
                        </div>
                    </div>
                </div>
            )}

            {/* --- LOGOUT CONFIRMATION MODAL --- */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </div>

                        <div className="mt-4 text-center text-xl font-black text-slate-900">
                            Konfirmasi Keluar
                        </div>
                        <div className="mt-2 text-center text-sm font-semibold text-slate-500">
                            Apakah Anda yakin ingin mengakhiri sesi kasir ini?
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 rounded-3xl border border-slate-200 bg-white py-3 font-black text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
                            >
                                Batal
                            </button>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex-1 rounded-3xl bg-red-600 py-3 font-black text-white shadow-lg shadow-red-600/25 hover:bg-red-700 active:scale-[0.99]"
                            >
                                Ya, Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STRUK PRINT --- */}
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
                        <div className="flex justify-between">
                            <span>No: {receiptData?.invoice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tgl: {receiptData?.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir: {receiptData?.cashier}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Plg: {receiptData?.customerType}</span>
                        </div>
                    </div>
                    <div className="mb-2 border-b border-dashed border-black" />
                    <div className="mb-2 space-y-1">
                        {receiptData?.items.map((item, i) => (
                            <div key={i}>
                                <div className="font-bold">{item.name}</div>
                                <div className="flex justify-between pl-2">
                                    <span>
                                        {item.qty} x{' '}
                                        {parseInt(
                                            item.sell_price,
                                        ).toLocaleString('id-ID')}
                                    </span>
                                    <span>
                                        {(
                                            item.qty * item.sell_price
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
                        <p>Barang yg dibeli tdk dpt ditukar/dikembalikan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}