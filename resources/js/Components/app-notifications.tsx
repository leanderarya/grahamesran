import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AppNotificationType = 'success' | 'error' | 'warning' | 'info';

type AppNotificationPayload = {
    title?: string;
    message: string;
    type?: AppNotificationType;
    duration?: number;
    persistent?: boolean;
};

type AppNotificationItem = AppNotificationPayload & {
    id: number;
    type: AppNotificationType;
};

const APP_NOTIFICATION_EVENT = 'app:notification';

let notificationCounter = 0;

function emitNotification(payload: AppNotificationPayload) {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(
        new CustomEvent(APP_NOTIFICATION_EVENT, {
            detail: payload,
        }),
    );
}

export function notifySuccess(message: string, title = 'Berhasil') {
    emitNotification({ type: 'success', title, message });
}

export function notifyError(message: string, title = 'Terjadi kendala') {
    emitNotification({ type: 'error', title, message, duration: 6000 });
}

export function notifyWarning(message: string, title = 'Perlu perhatian') {
    emitNotification({ type: 'warning', title, message, duration: 5000 });
}

export function notifyInfo(message: string, title = 'Informasi') {
    emitNotification({ type: 'info', title, message });
}

const toneClasses: Record<AppNotificationType, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-slate-200 bg-white text-slate-900',
};

const iconToneClasses: Record<AppNotificationType, string> = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-slate-900 text-white',
};

function NotificationIcon({ type }: { type: AppNotificationType }) {
    if (type === 'success') {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        );
    }

    if (type === 'warning') {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v4m0 4h.01M10.29 3.86l-8 14A1 1 0 003.16 19h17.68a1 1 0 00.87-1.5l-8-14a1 1 0 00-1.74 0z"
                />
            </svg>
        );
    }

    if (type === 'error') {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        );
    }

    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export function AppNotifications({
    flash,
}: {
    flash?: { success?: string | null; error?: string | null };
}) {
    const [items, setItems] = useState<AppNotificationItem[]>([]);
    const timeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
    const lastFlashRef = useRef({ success: null as string | null, error: null as string | null });

    const removeNotification = useCallback((id: number) => {
        const timeout = timeoutRefs.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(id);
        }

        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    const addNotification = useCallback(
        (payload: AppNotificationPayload) => {
            const message = payload.message?.trim();
            if (!message) return;

            const item: AppNotificationItem = {
                id: ++notificationCounter,
                type: payload.type ?? 'info',
                title: payload.title,
                message,
                duration: payload.duration,
                persistent: payload.persistent,
            };

            setItems((current) => [...current.slice(-3), item]);

            if (!item.persistent) {
                const timeout = setTimeout(() => {
                    removeNotification(item.id);
                }, item.duration ?? 4200);

                timeoutRefs.current.set(item.id, timeout);
            }
        },
        [removeNotification],
    );

    useEffect(() => {
        const handleNotification = (event: Event) => {
            const detail = (event as CustomEvent<AppNotificationPayload>).detail;
            addNotification(detail);
        };

        window.addEventListener(APP_NOTIFICATION_EVENT, handleNotification);

        return () => {
            window.removeEventListener(APP_NOTIFICATION_EVENT, handleNotification);

            timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
            timeoutRefs.current.clear();
        };
    }, [addNotification]);

    useEffect(() => {
        const nextSuccess = flash?.success ?? null;
        const nextError = flash?.error ?? null;

        if (nextSuccess && nextSuccess !== lastFlashRef.current.success) {
            addNotification({
                type: 'success',
                title: 'Berhasil',
                message: nextSuccess,
            });
        }

        if (nextError && nextError !== lastFlashRef.current.error) {
            addNotification({
                type: 'error',
                title: 'Terjadi kendala',
                message: nextError,
                duration: 6000,
            });
        }

        lastFlashRef.current = {
            success: nextSuccess,
            error: nextError,
        };
    }, [addNotification, flash?.error, flash?.success]);

    const visibleItems = useMemo(() => items.slice(-4), [items]);

    return (
        <div className="pointer-events-none fixed top-4 right-4 left-4 z-[100] flex flex-col gap-3 sm:left-auto sm:w-[380px]">
            {visibleItems.map((item) => (
                <div
                    key={item.id}
                    className={cn(
                        'pointer-events-auto rounded-[1.5rem] border px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur transition-all duration-200',
                        toneClasses[item.type],
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={cn(
                                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                iconToneClasses[item.type],
                            )}
                        >
                            <NotificationIcon type={item.type} />
                        </div>

                        <div className="min-w-0 flex-1">
                            {item.title && (
                                <div className="text-sm font-black tracking-tight">
                                    {item.title}
                                </div>
                            )}
                            <div className="mt-1 text-sm font-semibold leading-6 opacity-90">
                                {item.message}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeNotification(item.id)}
                            className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
                            aria-label="Tutup notifikasi"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
