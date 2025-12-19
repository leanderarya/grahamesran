// @ts-nocheck
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

const cx = (...c) => c.filter(Boolean).join(' ');

function IconMail({ className }) {
    return (
        <svg
            className={className}
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
    );
}
function IconLock({ className }) {
    return (
        <svg
            className={className}
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
    );
}
function IconEye({ className }) {
    return (
        <svg
            className={className}
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
    );
}
function IconEyeOff({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
            />
        </svg>
    );
}

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 19) return 'Selamat Sore';
        return 'Selamat Malam';
    }, []);

    useEffect(() => {
        return () => reset('password');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-[100dvh] bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
            <Head title="Login Staff - Graha Mesran" />

            {/* FULL WIDTH GRID (ini yang memperbaiki “kepotong”) */}
            <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
                {/* LEFT: lightweight branding (no photo, no blur, no pattern) */}
                <aside className="relative hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950/60" />
                    <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between p-14 text-white">
                        <div className="text-[11px] font-extrabold tracking-[0.22em] text-white/60 uppercase">
                            Sistem Manajemen Bengkel
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                                    <svg
                                        className="h-6 w-6 text-white"
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
                                <div className="leading-tight">
                                    <div className="text-sm font-black tracking-tight">
                                        GRAHA MESRAN
                                    </div>
                                    <div className="text-xs font-semibold text-white/60">
                                        Staff Login
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="text-xs font-black tracking-widest text-white/50 uppercase">
                                    Status Sistem
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                    Online
                                </div>
                            </div>
                        </div>

                        <div className="text-[11px] font-semibold text-white/40">
                            © 2025 Graha Mesran
                        </div>
                    </div>
                </aside>

                {/* RIGHT: form */}
                <main className="flex min-h-[100dvh] items-center justify-center px-6 py-10">
                    <div className="w-full max-w-[420px]">
                        {/* Mobile header */}
                        <div className="mb-7 lg:hidden">
                            <div className="flex items-center gap-3">
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
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
                                <div className="leading-tight">
                                    <div className="text-base font-black tracking-tight">
                                        GRAHA MESRAN
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500">
                                        Login Staff
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-7">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                {greeting}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Masuk untuk memulai shift.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                                <svg
                                    className="mt-0.5 h-5 w-5 shrink-0"
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
                                <div>{status}</div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* EMAIL */}
                            <div className="space-y-1.5">
                                <InputLabel
                                    htmlFor="email"
                                    value="Email"
                                    className="ml-1 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase"
                                />
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <IconMail className="h-5 w-5" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={cx(
                                            'block w-full rounded-2xl border-0 bg-slate-50 py-4 pr-4 pl-12 text-slate-900 shadow-sm',
                                            'ring-1 ring-slate-200/70 transition',
                                            'placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600',
                                        )}
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

                            {/* PASSWORD */}
                            <div className="space-y-1.5">
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="ml-1 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase"
                                />
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <IconLock className="h-5 w-5" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        value={data.password}
                                        className={cx(
                                            'block w-full rounded-2xl border-0 bg-slate-50 py-4 pr-12 pl-12 text-slate-900 shadow-sm',
                                            'ring-1 ring-slate-200/70 transition',
                                            'placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600',
                                        )}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-700 focus:outline-none"
                                        aria-label={
                                            showPassword
                                                ? 'Sembunyikan password'
                                                : 'Tampilkan password'
                                        }
                                    >
                                        {showPassword ? (
                                            <IconEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IconEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="ml-1"
                                />
                            </div>

                            {/* UTIL */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex cursor-pointer items-center select-none">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-5 w-5 rounded border-slate-300 text-blue-600 transition focus:ring-blue-600"
                                    />
                                    <span className="ms-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800">
                                        Ingat saya
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-bold text-blue-600 underline decoration-2 underline-offset-4 hover:text-blue-800"
                                    >
                                        Lupa Password?
                                    </Link>
                                )}
                            </div>

                            {/* SUBMIT */}
                            <PrimaryButton
                                className={cx(
                                    'mt-2 flex w-full justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white shadow-sm',
                                    'transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-70',
                                )}
                                disabled={processing}
                            >
                                <span className="flex items-center gap-2">
                                    {processing ? (
                                        <>
                                            <svg
                                                className="h-5 w-5 animate-spin text-white/80"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        'Masuk'
                                    )}
                                </span>
                            </PrimaryButton>
                        </form>

                        <p className="mt-10 text-center text-[11px] font-semibold text-slate-400">
                            © 2025 Graha Mesran Garage
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}