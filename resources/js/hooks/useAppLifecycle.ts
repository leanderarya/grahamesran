import { useEffect } from 'react';
import { isNative } from '@/lib/capacitor';

export function useAppLifecycle(onResume?: () => void, onPause?: () => void) {
    useEffect(() => {
        if (!isNative()) return;

        import('@capacitor/app').then(({ App }) => {
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    onResume?.();
                } else {
                    onPause?.();
                }
            });

            App.addListener('resume', () => {
                onResume?.();
            });
        });
    }, [onResume, onPause]);
}
