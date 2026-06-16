import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    onClick: () => void;
}

interface PosSidebarProps {
    activeMenu: string;
    sidebarCollapsed: boolean;
    hasOpenSession: boolean;
    sessionOpenedAt?: string;
    user: { name?: string };
    storeAddress: string;
    storePhone: string;
    menuItems: MenuItem[];
    statusCardDescription: React.ReactNode;
    sessionButtonLabel: string;
    sessionButtonCollapsedLabel: string;
    onSessionButtonClick: () => void;
}

export function PosSidebar({
    activeMenu,
    sidebarCollapsed,
    hasOpenSession,
    sessionOpenedAt,
    user,
    storeAddress,
    storePhone,
    menuItems,
    statusCardDescription,
    sessionButtonLabel,
    sessionButtonCollapsedLabel,
    onSessionButtonClick,
}: PosSidebarProps) {
    return (
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
                            className={cn(
                                'text-sm font-bold tracking-[0.2em] text-slate-300 uppercase',
                                sidebarCollapsed
                                    ? 'hidden'
                                    : 'hidden xl:block',
                            )}
                        >
                            Graha Motor
                        </div>
                        <div
                            className={cn(
                                'mt-1 text-lg font-bold',
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
                        className={cn(
                            'flex shrink-0 items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-bold transition-all duration-200 lg:w-full lg:justify-center lg:px-0',
                            !sidebarCollapsed &&
                                'xl:justify-start xl:px-4',
                            activeMenu === item.id
                                ? 'bg-white text-slate-950'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white',
                        )}
                    >
                        <item.icon />
                        <span
                            className={cn(
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
                        <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Status Kasir
                        </div>
                        <div className="mt-3 text-lg font-bold lg:text-center xl:text-left">
                            {hasOpenSession
                                ? 'Sesi Aktif'
                                : 'Belum Dibuka'}
                        </div>
                        <div className="mt-1 text-sm text-slate-300 lg:hidden xl:block">
                            {hasOpenSession
                                ? `Dibuka ${formatDateTime(sessionOpenedAt)}`
                                : statusCardDescription}
                        </div>

                        <button
                            onClick={onSessionButtonClick}
                            className="mt-4 w-full rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
                        >
                            <span className="lg:hidden xl:inline">
                                {sessionButtonLabel}
                            </span>
                            <span className="hidden lg:inline xl:hidden">
                                {sessionButtonCollapsedLabel}
                            </span>
                        </button>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 p-4 lg:mt-8">
                        <div className="text-sm font-bold">
                            {user?.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                            Kasir aktif
                        </div>
                        <div className="mt-4 hidden text-xs font-semibold text-slate-400 xl:block">
                            {storeAddress}
                        </div>
                        <div className="hidden text-xs font-semibold text-slate-400 xl:block">
                            {storePhone}
                        </div>
                    </div>
                </>
            )}
        </aside>
    );
}
