import { useEffect } from 'react';
import { isNative } from '@/lib/capacitor';

export function useAndroidBackButton() {
    useEffect(() => {
        if (!isNative()) return;

        import('@capacitor/app').then(({ App }) => {
            App.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else {
                    // Exit confirmation
                    App.exitApp();
                }
            });
        });
    }, []);
}
