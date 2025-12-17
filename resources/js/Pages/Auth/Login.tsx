// @ts-nocheck
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 11) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 19) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');

        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white lg:overflow-hidden">
            <Head title="Login Staff - Graha Mesran" />

            {/* --- BAGIAN KIRI: BRANDING & VISUAL (Desktop) --- */}
            <div className="relative hidden w-1/2 bg-slate-900 lg:block">
                <div className="absolute inset-0 h-full w-full overflow-hidden">
                    {/* Placeholder Background jika gambar tidak ada */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-40 transition-transform duration-[40s] hover:scale-110"></div>

                    {/* Overlay Gradient Modern */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-blue-900/20 mix-blend-multiply"></div>
                </div>

                {/* Konten Text Kiri */}
                <div className="relative z-10 flex h-full flex-col justify-between px-16 py-20 text-white">
                    <div className="text-sm font-bold tracking-widest uppercase opacity-70">
                        Sistem Manajemen Bengkel
                    </div>

                    <div>
                        <div className="mb-6 h-1.5 w-24 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                        <h1 className="mb-6 text-7xl leading-none font-black tracking-tighter text-white drop-shadow-2xl">
                            GRAHA
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                MESRAN.
                            </span>
                        </h1>
                        <p className="max-w-md border-l-2 border-slate-700 pl-6 text-lg leading-relaxed font-light text-slate-300">
                            Kelola inventaris, pantau stok, dan proses transaksi
                            kasir dengan kecepatan tinggi dalam satu ekosistem.
                        </p>
                    </div>

                    <div className="font-mono text-xs text-slate-500">
                        Server Status:{' '}
                        <span className="text-green-400">● Online</span>
                    </div>
                </div>
            </div>

            {/* --- BAGIAN KANAN: FORM LOGIN --- */}
            <div className="relative flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32">
                <div className="mx-auto w-full max-w-[420px]">
                    {/* Header Mobile Only */}
                    <div className="mb-12 text-center lg:hidden">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                            Graha Mesran
                        </h2>
                        <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-blue-500"></div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            {greeting}, Staff.
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Masuk untuk memulai shift atau mengelola toko.
                        </p>
                    </div>

                    {status && (
                        <div className="animate-fade-in-down mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 p-4 text-sm font-medium text-green-700 backdrop-blur-sm">
                            <svg
                                className="h-5 w-5 shrink-0 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* EMAIL INPUT */}
                        <div className="space-y-1.5">
                            <InputLabel
                                htmlFor="email"
                                value="Email Perusahaan"
                                className="ml-1 text-xs font-bold tracking-wide text-slate-500 uppercase"
                            />
                            <div className="group relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <svg
                                        className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full rounded-xl border-0 bg-slate-50 py-4 pr-4 pl-12 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="user@grahamesran.com"
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="ml-1"
                            />
                        </div>

                        {/* PASSWORD INPUT */}
                        <div className="space-y-1.5">
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="ml-1 text-xs font-bold tracking-wide text-slate-500 uppercase"
                            />
                            <div className="group relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <svg
                                        className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full rounded-xl border-0 bg-slate-50 py-4 pr-12 pl-12 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={errors.password}
                                className="ml-1"
                            />
                        </div>

                        {/* UTILITIES */}
                        <div className="flex items-center justify-between pt-2">
                            <label className="group flex cursor-pointer items-center select-none">
                                <div className="relative flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-5 w-5 rounded border-slate-300 text-blue-600 transition-all focus:ring-blue-500"
                                    />
                                </div>
                                <span className="ms-2.5 text-sm font-medium text-slate-500 transition-colors group-hover:text-slate-700">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-bold text-blue-600 decoration-2 underline-offset-4 transition-colors hover:text-blue-800 hover:underline"
                                >
                                    Lupa Password?
                                </Link>
                            )}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <PrimaryButton
                            className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-slate-900 px-6 py-4 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-500/25 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                            disabled={processing}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {processing ? (
                                    <>
                                        <svg
                                            className="h-5 w-5 animate-spin text-white/80"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        Masuk System
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </PrimaryButton>
                    </form>

                    <p className="mt-12 text-center text-xs font-medium text-slate-400">
                        © 2025 Graha Mesran Garage. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
