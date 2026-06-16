import InputError from '@/Components/input-error';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, HelpCircle, Lock, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { route } from 'ziggy-js';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const emailRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 19) return 'Selamat Sore';
        return 'Selamat Malam';
    }, []);

    useEffect(() => {
        emailRef.current?.focus();

        return () => reset('password');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('login'));
    };

    const fieldWrapperClass =
        'group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition-all duration-200 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-lg';

    const inputClass =
        'ml-3 w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0';

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950">
            <Head title="Masuk - Graha Motor" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10rem] left-[-6rem] h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute right-[-7rem] bottom-[-8rem] h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/90 via-white/40 to-transparent" />
            </div>

            <main className="relative mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-8 sm:px-6">
                <section className="mx-auto w-full max-w-md">
                    <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
                        <div className="mt-8">
                            <div className="text-center font-sans text-3xl font-extrabold tracking-tight text-slate-950">
                                {greeting}
                            </div>
                            <p className="mt-2 text-center text-sm font-medium text-slate-500">
                                Masuk untuk melanjutkan aktivitas hari ini.
                            </p>
                        </div>

                        {status && (
                            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-xs font-bold tracking-widest text-slate-400 uppercase"
                                >
                                    Email atau Username
                                </label>

                                <div className={cn(fieldWrapperClass, 'mt-2')}>
                                    <User className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-slate-600" />
                                    <input
                                        id="email"
                                        ref={emailRef}
                                        type="text"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        placeholder="Masukkan email atau username"
                                        className={inputClass}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                    />
                                </div>

                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="text-xs font-bold tracking-widest text-slate-400 uppercase"
                                    >
                                        Kata Sandi
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-bold text-slate-950 transition hover:text-slate-800"
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>

                                <div className={cn(fieldWrapperClass, 'mt-2')}>
                                    <Lock className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-slate-600" />
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className={inputClass}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current,
                                            )
                                        }
                                        className="ml-3 shrink-0 text-slate-400 transition hover:text-slate-700 focus:outline-none"
                                        aria-label={
                                            showPassword
                                                ? 'Sembunyikan kata sandi'
                                                : 'Tampilkan kata sandi'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>

                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(event) =>
                                        setData(
                                            'remember',
                                            event.target.checked,
                                        )
                                    }
                                    className="h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-0"
                                />
                                <span className="text-sm font-semibold text-slate-600">
                                    Ingat saya di perangkat ini
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <span>
                                    {processing
                                        ? 'Memproses...'
                                        : 'Masuk ke Akun'}
                                </span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                            <p className="mb-4 text-[11px] font-bold tracking-[0.28em] text-slate-400 uppercase">
                                Butuh bantuan
                            </p>
                            <div className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                                <HelpCircle className="h-4 w-4" />
                                Hubungi admin toko
                            </div>
                        </div>
                    </div>

                    <footer className="mt-8 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © 2026 Graha Motor
                        </p>
                    </footer>
                </section>
            </main>
        </div>
    );
}
