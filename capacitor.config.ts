import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.grahamotor.kasir',
    appName: 'Graha Motor Kasir',
    webDir: 'public/build',
    server: {
        // For development: point to local Laravel server
        // Change to production URL before release
        url: 'http://192.168.1.16:8000', // Host machine IP for emulator
        cleartext: true,
    },
    android: {
        allowMixedContent: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#1f2937', // dark gray matching POS theme
            showSpinner: false,
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            splashFullScreen: true,
            launchAutoHide: true,
        },
    },
};

export default config;
