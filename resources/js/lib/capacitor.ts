/**
 * Detect if running inside Capacitor native shell.
 * Returns false on web — no Capacitor dependency loaded.
 */
export function isNative(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Capacitor' in window &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}
