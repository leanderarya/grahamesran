import { cn } from '@/lib/utils';

export function PosLayout({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('grid h-dvh lg:grid-cols-[88px_minmax(0,1fr)_360px] xl:grid-cols-[260px_minmax(0,1fr)_420px]', className)}>
            {children}
        </div>
    );
}

export function PosSidebar({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <aside className={cn('flex flex-col bg-slate-950 text-white', className)}>
            {children}
        </aside>
    );
}

export function PosMain({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <main className={cn('flex flex-col overflow-hidden', className)}>
            {children}
        </main>
    );
}

export function PosCheckout({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <aside className={cn('hidden flex-col border-l border-slate-200 bg-white lg:flex', className)}>
            {children}
        </aside>
    );
}
