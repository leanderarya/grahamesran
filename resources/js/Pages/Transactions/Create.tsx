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

// --- ICONS ---
const Icons = {
    Search: () => (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    ),
    Scan: () => (
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
            className="h-8 w-8"
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
            className="h-8 w-8"
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
            className="h-8 w-8"
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
            className="h-6 w-6"
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
            className="h-6 w-6"
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
            className="h-6 w-6"
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

const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num);

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
        <div
            onClick={() => !isOutOfStock && onAdd(product)}
            className={`relative flex touch-manipulation flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition will-change-transform select-none ${
                isOutOfStock
                    ? 'border-slate-200 bg-slate-50 opacity-50 grayscale'
                    : 'border-slate-200 hover:-translate-y-[1px] hover:shadow-md active:scale-95'
            }`}
        >
            <div className="mb-2 flex items-start justify-between">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                    {product.sku || 'NOSKU'}
                </span>
                <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        isOutOfStock
                            ? 'bg-red-100 text-red-600'
                            : isLowStock
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                    }`}
                >
                    {isOutOfStock
                        ? 'HABIS'
                        : isLowStock
                          ? `SISA: ${stockNum}`
                          : `STOK: ${stockNum}`}
                </span>
            </div>

            <div className="mb-3 flex-1">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-bold text-slate-900">
                    {product.name}
                </h3>
                {product.vehicles?.length > 0 && (
                    <div className="mt-1 flex w-fit max-w-full items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] text-blue-700">
                        <Icons.Box />
                        <span className="truncate">
                            {product.vehicles.map((v) => v.model).join(', ')}
                        </span>
                    </div>
                )}
            </div>

            {customerType === 'workshop' && workshopPrice > 0 && (
                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-orange-600">
                    <Icons.Tag />
                    <span>Harga Bengkel</span>
                </div>
            )}

            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-xs text-slate-400">Harga</span>
                <span
                    className={`text-base font-black ${
                        customerType === 'workshop'
                            ? 'text-orange-600'
                            : 'text-slate-800'
                    }`}
                >
                    Rp {formatRupiah(activePrice)}
                </span>
            </div>
        </div>
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
                    className={`flex min-h-[60px] items-center justify-center rounded-2xl text-2xl font-bold shadow-sm transition-all active:scale-95 ${
                        typeof btn === 'number'
                            ? 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
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

    const handleNumpadInput = useCallback((num) => {
        setCashReceived((prev) => prev + num.toString());
    }, []);
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
                border: 'border-green-500',
                ring: 'ring-green-200',
                iconBg: 'bg-green-100',
                iconText: 'text-green-600',
            },
            qris: {
                border: 'border-slate-500',
                ring: 'ring-slate-200',
                iconBg: 'bg-slate-100',
                iconText: 'text-slate-600',
            },
            bank: {
                border: 'border-blue-500',
                ring: 'ring-blue-200',
                iconBg: 'bg-blue-100',
                iconText: 'text-blue-600',
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

    const isWorkshop = customerType === 'workshop';

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
        // PERBAIKAN: Gunakan 'beepAudio.current', BUKAN 'audioRef.current'
        if (beepAudio.current) {
            beepAudio.current.currentTime = 0;
            beepAudio.current
                .play()
                .catch((e) => console.log('Audio play failed', e));
        }
    };

    const onScanSuccess = useCallback(
        (decodedText, decodedResult) => {
            const scannedOriginal = String(decodedText).trim().toUpperCase();

            // Cek Ref (Cegah Double Scan Instan)
            if (lastScannedRef.current === scannedOriginal) return;

            // Kunci sementara
            lastScannedRef.current = scannedOriginal;

            const scannedNoZero = scannedOriginal.replace(/^0+/, '');

            const product = products.find((p) => {
                const skuDb = String(p.sku || '')
                    .trim()
                    .toUpperCase();
                return skuDb === scannedOriginal || skuDb === scannedNoZero;
            });

            if (product) {
                // === SUKSES ===
                playBeep();
                addToCart(product);

                // 1. TAMPILKAN POPUP BERHASIL
                setScanToast(`Berhasil: ${product.name}`);

                // 2. Hilangkan popup setelah 2 detik
                setTimeout(() => setScanToast(null), 2000);

                // 3. JANGAN panggil setIsScannerOpen(false) agar kamera tetap nyala!

                // Cooldown scan
                if (navigator.vibrate) navigator.vibrate(50);
                setTimeout(() => {
                    lastScannedRef.current = null;
                }, 1500);
            } else {
                // === GAGAL ===
                playBeep();

                // Tampilkan pesan gagal di popup juga (biar gak pakai alert yg mengganggu)
                setScanToast(`❌ Barang tidak ditemukan: ${scannedOriginal}`);
                setTimeout(() => setScanToast(null), 3000);

                setTimeout(() => {
                    lastScannedRef.current = null;
                }, 2000);
            }
        },
        [products, addToCart],
    );

    // Efek untuk Menyalakan/Mematikan Kamera
    // 1. Update Ref setiap kali logika scan berubah (tanpa mematikan kamera)
    useEffect(() => {
        scanCallbackRef.current = onScanSuccess;
    }, [onScanSuccess]);

    // 2. Efek Kamera Utama (Hanya restart jika Modal dibuka/tutup)
    useEffect(() => {
        let isMounted = true;

        if (isScannerOpen) {
            const timer = setTimeout(() => {
                if (!isMounted) return;
                if (!document.getElementById('reader')) return;
                if (scannerRef.current) return; // Jangan start kalau sudah jalan

                const html5QrCode = new Html5Qrcode('reader', false);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    // Config dinamis mencegah crash resolusi
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdgePercentage = 0.7;
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
                        // DISINI KUNCINYA:
                        // Kita panggil fungsi lewat Ref, bukan langsung.
                        // Jadi scanner tidak peduli jika 'onScanSuccess' berubah di background.
                        (decodedText, decodedResult) => {
                            if (scanCallbackRef.current) {
                                scanCallbackRef.current(
                                    decodedText,
                                    decodedResult,
                                );
                            }
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
            }, 500);

            return () => clearTimeout(timer);
        } else {
            // CLEANUP: Stop kamera hanya saat modal DITUTUP (isScannerOpen = false)
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        scannerRef.current.clear();
                        scannerRef.current = null;
                    })
                    .catch((err) => {
                        // Ignore error stop
                        scannerRef.current = null;
                    });
            }
        }

        return () => {
            isMounted = false;
        };

        // PERHATIKAN: Dependency CUMA 'isScannerOpen'.
        // 'onScanSuccess' DIHAPUS dari sini agar kamera tidak restart saat cart update.
    }, [isScannerOpen]);

    return (
        <div
            className={`flex h-screen w-full flex-col overflow-hidden font-sans text-slate-800 transition-colors duration-300 ${
                isWorkshop ? 'bg-orange-50' : 'bg-slate-100'
            }`}
        >
            <Head title="Kasir - Graha Mesran" />

            {/* --- HEADER --- */}
            <div className="z-20 flex h-16 shrink-0 items-center gap-3 bg-white px-4 py-3 shadow-sm print:hidden">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-colors ${
                        isWorkshop
                            ? 'bg-orange-500 shadow-orange-200'
                            : 'bg-blue-600 shadow-blue-200'
                    }`}
                >
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                </div>

                <div className="relative flex flex-1 gap-2">
                    {' '}
                    {/* Ubah flex-1 jadi flex container */}
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Icons.Search />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Barang / SKU / Motor..."
                            className={`w-full rounded-xl border-none py-3 pr-4 pl-10 font-bold text-slate-800 placeholder-slate-400 shadow-inner transition-all focus:ring-2 ${
                                isWorkshop
                                    ? 'bg-orange-50 focus:bg-white focus:ring-orange-500'
                                    : 'bg-slate-100 focus:bg-white focus:ring-blue-500'
                            }`}
                        />
                    </div>
                    {/* --- TOMBOL SCAN BARU --- */}
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="flex items-center justify-center rounded-xl bg-slate-800 px-4 text-white shadow-lg transition-transform active:scale-95"
                    >
                        <Icons.Scan />
                        <span className="ml-2 hidden text-sm font-bold md:inline">
                            Scan
                        </span>
                    </button>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1">
                    <button
                        onClick={() => setCustomerType('general')}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                            !isWorkshop
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        UMUM
                    </button>
                    <button
                        onClick={() => setCustomerType('workshop')}
                        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                            isWorkshop
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Icons.Tag />
                        BENGKEL
                    </button>
                </div>

                <button
                    onClick={() => setShowCartMobile(!showCartMobile)}
                    className="relative rounded-xl bg-slate-100 p-3 text-slate-700 active:bg-slate-200 lg:hidden"
                >
                    <Icons.Cart />
                    {data.cart.length > 0 && (
                        <span className="absolute top-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-red-500"></span>
                    )}
                </button>

                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="rounded-xl p-3 text-red-500 transition-transform hover:bg-red-50 active:scale-95"
                >
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
                </button>
            </div>

            {/* --- BODY --- */}
            <div className="relative flex flex-1 overflow-hidden print:hidden">
                {/* PRODUCT GRID */}
                <div
                    className={`flex-1 overflow-y-auto p-4 transition-colors md:p-6 ${
                        isWorkshop ? 'bg-orange-50' : 'bg-slate-100'
                    }`}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {!!deferredSearch?.trim() && (
                        <div className="mb-3 text-xs font-bold text-slate-500">
                            Menampilkan {filteredProducts.length} hasil (maks
                            30)
                        </div>
                    )}

                    {filteredProducts.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center opacity-40">
                            <Icons.Search />
                            <p className="mt-2 font-bold">
                                Barang tidak ditemukan
                            </p>
                        </div>
                    ) : (
                        <div
                            className="grid gap-4 pb-24 md:pb-6 lg:pb-4"
                            style={{
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                            }}
                        >
                            {/* Responsive grid columns via CSS media queries using Tailwind breakpoints */}
                            <style>{`
                                @media (min-width: 768px) {
                                  .pos-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                                }
                                @media (min-width: 1280px) {
                                  .pos-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                                }
                                @media (min-width: 1536px) {
                                  .pos-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
                                }
                            `}</style>

                            <div
                                className="pos-grid grid gap-4"
                                style={{ gridTemplateColumns: 'inherit' }}
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAdd={addToCart}
                                        customerType={customerType}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* CART SIDEBAR */}
                <div
                    className={`fixed inset-0 z-30 flex transform flex-col bg-white shadow-2xl transition-transform duration-300 lg:relative lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100vh-4rem)] lg:w-[380px] lg:translate-x-0 lg:overflow-hidden lg:border-l lg:border-slate-200 lg:shadow-none ${showCartMobile ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 lg:hidden">
                        <h2 className="text-lg font-bold">Keranjang</h2>
                        <button
                            onClick={() => setShowCartMobile(false)}
                            className="rounded-full bg-white p-2 shadow-sm"
                        >
                            <Icons.Close />
                        </button>
                    </div>

                    <div
                        className={`hidden items-center justify-between border-b p-4 lg:flex ${
                            isWorkshop
                                ? 'border-orange-100 bg-orange-50/50'
                                : 'border-slate-100 bg-slate-50/50'
                        }`}
                    >
                        <div>
                            <h2 className="text-lg font-black text-slate-800">
                                Keranjang
                            </h2>
                            <p
                                className={`text-xs ${isWorkshop ? 'font-bold text-orange-600' : 'text-slate-500'}`}
                            >
                                {isWorkshop
                                    ? 'MODE: HARGA BENGKEL'
                                    : `${data.cart.length} Item Ditambahkan`}
                            </p>
                        </div>
                        <button
                            onClick={clearCart}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 active:scale-95"
                        >
                            HAPUS
                        </button>
                    </div>

                    {/* Cart list scroll area */}
                    <div className="flex-1 overflow-y-auto bg-white p-4">
                        {data.cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-slate-300">
                                <Icons.Cart />
                                <p className="mt-2 text-sm">Keranjang Kosong</p>
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
                                            className={`flex flex-col rounded-2xl border bg-white p-3 shadow-sm ${
                                                isWorkshop
                                                    ? 'border-orange-100'
                                                    : 'border-slate-100'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <h4 className="line-clamp-2 w-3/4 text-sm leading-tight font-bold text-slate-800">
                                                    {item.name}
                                                </h4>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 active:scale-95"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <div className="text-xs text-slate-500">
                                                    @ Rp{' '}
                                                    {formatRupiah(currentPrice)}
                                                </div>
                                                <div
                                                    className={`font-black ${isWorkshop ? 'text-orange-600' : 'text-slate-800'}`}
                                                >
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        currentPrice *
                                                            (Number(item.qty) ||
                                                                0),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, -1)
                                                    }
                                                    disabled={
                                                        (Number(item.qty) ||
                                                            1) <= 1
                                                    }
                                                    className="flex h-11 flex-1 items-center justify-center font-bold text-slate-500 active:bg-slate-200 disabled:opacity-40"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="h-11 w-16 border-0 bg-transparent p-0 text-center text-lg font-black text-slate-800 focus:ring-0"
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
                                                        updateQty(item.id, 1)
                                                    }
                                                    className="flex h-11 flex-1 items-center justify-center font-bold text-blue-600 active:bg-blue-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cart footer sticky-like */}
                    <div className="shrink-0 border-t border-slate-100 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <div className="mb-4 flex items-end justify-between">
                            <span className="text-sm font-bold text-slate-500">
                                Total
                            </span>
                            <span
                                className={`text-3xl font-black tracking-tight ${isWorkshop ? 'text-orange-600' : 'text-slate-900'}`}
                            >
                                Rp {formatRupiah(totalAmount)}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                if (data.cart.length > 0) setPaymentOpen(true);
                            }}
                            disabled={data.cart.length === 0}
                            className={`w-full rounded-2xl py-4 text-lg font-bold shadow-xl transition-all active:scale-[0.98] ${
                                data.cart.length === 0
                                    ? 'bg-slate-200 text-slate-400'
                                    : isWorkshop
                                      ? 'bg-orange-500 text-white shadow-orange-500/30'
                                      : 'bg-blue-600 text-white shadow-blue-500/30'
                            }`}
                        >
                            Bayar Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* --- PAYMENT MODAL --- */}
            {isPaymentOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white md:flex-row print:hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 p-4 md:hidden">
                        <button
                            onClick={() => setPaymentOpen(false)}
                            className="flex items-center gap-2 font-bold text-slate-500"
                        >
                            <Icons.Back /> Kembali
                        </button>
                        <h3 className="text-lg font-bold">Pembayaran</h3>
                    </div>

                    <div className="flex w-full flex-col overflow-y-auto bg-slate-50 p-6 md:w-5/12">
                        <div className="mb-6 hidden md:block">
                            <button
                                onClick={() => setPaymentOpen(false)}
                                className="flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-slate-800"
                            >
                                <Icons.Back /> Kembali ke Menu
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                                    Total Tagihan
                                </p>
                                {isWorkshop && (
                                    <span className="rounded bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600">
                                        HARGA BENGKEL
                                    </span>
                                )}
                            </div>
                            <p className="my-2 text-5xl font-black tracking-tighter text-slate-900">
                                <span className="mr-1 text-2xl font-medium text-slate-400">
                                    Rp
                                </span>
                                {formatRupiah(totalAmount)}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="font-bold text-slate-700">
                                Pilih Metode Bayar
                            </p>

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
                                        className={`flex w-full items-center rounded-2xl border-2 p-4 transition-all active:scale-[0.99] ${
                                            paymentMethod === m.id
                                                ? `${s.border} bg-white shadow-md ring-1 ${s.ring}`
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`mr-4 rounded-xl p-2 ${
                                                paymentMethod === m.id
                                                    ? `${s.iconBg} ${s.iconText}`
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            <m.icon />
                                        </div>
                                        <span
                                            className={`text-lg font-bold ${
                                                paymentMethod === m.id
                                                    ? 'text-slate-900'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {m.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col bg-white p-6 md:p-10">
                        {paymentMethod === 'cash' && (
                            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
                                <div className="mb-6 text-center">
                                    <p className="mb-1 font-medium text-slate-500">
                                        Uang Diterima
                                    </p>
                                    <div className="inline-block min-w-[220px] border-b-2 border-blue-500 pb-2 text-4xl font-black text-slate-800">
                                        {cashReceived ? (
                                            `Rp ${formatRupiah(parseInt(cashReceived))}`
                                        ) : (
                                            <span className="text-slate-300">
                                                Rp 0
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className={`mt-4 inline-block rounded-xl px-4 py-2 font-bold transition-colors ${
                                            change < 0
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-green-100 text-green-700'
                                        }`}
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
                                        className="rounded-2xl bg-blue-50 py-3 font-bold text-blue-700 active:bg-blue-100"
                                    >
                                        Uang Pas
                                    </button>
                                    <button
                                        onClick={() => setCashReceived('50000')}
                                        className="rounded-2xl bg-slate-50 py-3 font-bold text-slate-700 active:bg-slate-200"
                                    >
                                        50.000
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCashReceived('100000')
                                        }
                                        className="rounded-2xl bg-slate-50 py-3 font-bold text-slate-700 active:bg-slate-200"
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
                                        className="rounded-2xl bg-slate-50 py-3 font-bold text-slate-700 active:bg-slate-200"
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
                            <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                                    <img
                                        src={STORE_CONFIG.qrisUrl}
                                        alt="QRIS Code"
                                        className="mx-auto h-64 w-64 object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Pembayaran%20Graha%20Mesran%20Rp${totalAmount}`;
                                        }}
                                    />
                                    <p className="mt-2 font-bold text-slate-800">
                                        Scan QRIS
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        NMID: GRAHA MESRAN
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-blue-50 px-6 py-3 text-blue-800">
                                    <p className="animate-pulse font-bold">
                                        Menunggu Pembayaran...
                                    </p>
                                    <p className="text-sm">
                                        Nominal:{' '}
                                        <strong>
                                            Rp {formatRupiah(totalAmount)}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'bank' && (
                            <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-4 text-center">
                                <div className="relative mb-8 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl">
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
                                    <div className="mb-8 flex items-start justify-between">
                                        <span className="text-2xl font-black tracking-tighter italic">
                                            BCA
                                        </span>
                                        <span className="font-mono text-xs opacity-80">
                                            DEBIT / TF
                                        </span>
                                    </div>
                                    <div className="mb-2 text-left">
                                        <p className="text-xs tracking-widest uppercase opacity-70">
                                            Nomor Rekening
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-3xl font-bold tracking-widest">
                                                {STORE_CONFIG.bank.number}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        STORE_CONFIG.bank
                                                            .number,
                                                    )
                                                }
                                                className="rounded-xl bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30 active:scale-95"
                                            >
                                                {copied ? (
                                                    <Icons.Check />
                                                ) : (
                                                    <Icons.Copy />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 border-t border-white/20 pt-4 text-left">
                                        <p className="text-xs uppercase opacity-70">
                                            Atas Nama
                                        </p>
                                        <p className="truncate text-lg font-bold">
                                            {STORE_CONFIG.bank.holder}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-sm text-slate-500">
                                        Transfer Total:
                                    </p>
                                    <p className="text-2xl font-black text-slate-900">
                                        Rp {formatRupiah(totalAmount)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={processPayment}
                            disabled={
                                isProcessing ||
                                (paymentMethod === 'cash' && change < 0)
                            }
                            className="mt-6 w-full rounded-2xl bg-slate-900 py-5 text-xl font-bold text-white shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-4 shadow-2xl">
                        {/* HEADER MODAL */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                Scan Barcode
                            </h3>
                            <button
                                onClick={() => setIsScannerOpen(false)}
                                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-red-100 hover:text-red-500"
                            >
                                <Icons.Close />
                            </button>
                        </div>

                        {/* --- INI POPUP NOTIFIKASI (TOAST) --- */}
                        {scanToast && (
                            <div
                                className={`absolute top-16 right-4 left-4 z-10 transform animate-bounce rounded-xl p-3 text-center font-bold text-white shadow-lg transition-all ${
                                    scanToast.includes('❌')
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                }`}
                            >
                                {scanToast}
                            </div>
                        )}

                        {/* AREA KAMERA */}
                        <div className="relative overflow-hidden rounded-xl bg-black">
                            {/* Tambahkan min-h agar tidak gepeng */}
                            <div
                                id="reader"
                                className="min-h-[300px] w-full bg-black"
                            ></div>

                            {/* Garis Merah Laser (Pemanis Visual) */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-0.5 w-3/4 bg-red-500 opacity-50 shadow-[0_0_10px_red]"></div>
                            </div>
                        </div>

                        <p className="mt-4 text-center text-sm text-slate-500">
                            Arahkan kamera ke barcode barang. <br />
                            Otomatis lanjut scan barang berikutnya.
                        </p>
                    </div>
                </div>
            )}

            {/* --- LOGOUT CONFIRMATION MODAL --- */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
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
                        </div>
                        <h3 className="mb-2 text-center text-xl font-bold text-slate-800">
                            Konfirmasi Keluar
                        </h3>
                        <p className="mb-6 text-center text-sm text-slate-500">
                            Apakah Anda yakin ingin mengakhiri sesi kasir ini?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-slate-600 hover:bg-slate-50 active:scale-95"
                            >
                                Batal
                            </button>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex-1 rounded-2xl bg-red-500 py-3 font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600 active:scale-95"
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
                    <div className="mb-2 border-b border-dashed border-black"></div>
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
                    <div className="mb-2 border-b border-dashed border-black"></div>
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
                    <div className="mb-2 border-b border-dashed border-black"></div>
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
