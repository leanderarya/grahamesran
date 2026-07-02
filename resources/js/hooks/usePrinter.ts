import { useState, useEffect, useCallback } from 'react';
import { isNative } from '@/lib/capacitor';

interface BluetoothDevice {
    id: string;
    name: string;
    address: string;
}

// Access custom BluetoothThermalPrinter plugin via Capacitor
function getPlugin() {
    return (window as any).Capacitor?.Plugins?.BluetoothThermalPrinter;
}

export function usePrinter() {
    const [devices, setDevices] = useState<BluetoothDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Load saved printer on mount
    useEffect(() => {
        const saved = localStorage.getItem('printer_device');
        if (saved) {
            try {
                const device = JSON.parse(saved);
                setConnectedDevice(device);
            } catch {}
        }
    }, []);

    const scan = useCallback(async () => {
        if (!isNative()) {
            // Web: show mock devices for testing
            setDevices([
                { id: '00:11:22:33:44:55', name: 'MTP-III', address: '00:11:22:33:44:55' },
                { id: 'AA:BB:CC:DD:EE:FF', name: 'RPP300', address: 'AA:BB:CC:DD:EE:FF' },
            ]);
            return;
        }

        setIsScanning(true);
        try {
            const plugin = getPlugin();
            if (!plugin) throw new Error('Plugin Bluetooth tidak tersedia.');

            const response = await plugin.listPairedDevices();
            const found = response?.devices ?? [];
            setDevices(found);

            if (found.length === 0) {
                console.warn('No paired Bluetooth devices found. Pair your printer in Android Bluetooth settings first.');
            }
        } catch (error) {
            console.error('Scan failed:', error);
            throw error;
        } finally {
            setIsScanning(false);
        }
    }, []);

    const connect = useCallback(async (device: BluetoothDevice) => {
        if (!isNative()) {
            setConnectedDevice(device);
            setIsConnected(true);
            localStorage.setItem('printer_device', JSON.stringify(device));
            localStorage.setItem('printer_address', device.address);
            return;
        }

        try {
            const plugin = getPlugin();
            if (!plugin) throw new Error('Plugin Bluetooth tidak tersedia.');

            await plugin.connect({ deviceId: device.id || device.address });
            setConnectedDevice(device);
            setIsConnected(true);
            localStorage.setItem('printer_device', JSON.stringify(device));
            localStorage.setItem('printer_address', device.address);
        } catch (error) {
            console.error('Connect failed:', error);
            throw error;
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (!isNative()) {
            setConnectedDevice(null);
            setIsConnected(false);
            localStorage.removeItem('printer_device');
            localStorage.removeItem('printer_address');
            return;
        }

        try {
            const plugin = getPlugin();
            if (!plugin) throw new Error('Plugin Bluetooth tidak tersedia.');

            await plugin.disconnect();
            setConnectedDevice(null);
            setIsConnected(false);
            localStorage.removeItem('printer_device');
            localStorage.removeItem('printer_address');
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    }, []);

    return { devices, isScanning, scan, connect, disconnect, connectedDevice, isConnected };
}
