import { isNative } from '@/lib/capacitor';
import { useEffect, useState } from 'react';

export function useNetwork() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true,
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        let networkHandle: { remove: () => void } | undefined;

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // For Capacitor: use @capacitor/network if available
        if (isNative()) {
            import('@capacitor/network').then(({ Network }) => {
                Network.getStatus().then((status) => {
                    setIsOnline(status.connected);
                });

                Network.addListener('networkStatusChange', (status) => {
                    setIsOnline(status.connected);
                }).then((handle) => {
                    // Store handle for cleanup
                    networkHandle = handle;
                });
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            networkHandle?.remove();
        };
    }, []);

    return { isOnline };
}
