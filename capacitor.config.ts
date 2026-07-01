import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.grahamotor.kasir',
    appName: 'Graha Motor Kasir',
    webDir: 'public/build',
    server: {
        // For development: point to local Laravel server
        // Change to production URL before release
        url: 'http://10.0.2.2:8000', // Android emulator localhost
        cleartext: true,
    },
    android: {
        allowMixedContent: true,
    },
};

export default config;
