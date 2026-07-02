import { useState, useEffect, useCallback } from 'react';
import { isNative } from '@/lib/capacitor';

interface BluetoothDevice {
    name: string;
    address: string;
    type?: string;
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
                { name: 'MTP-III', address: '00:11:22:33:44:55' },
                { name: 'RPP300', address: 'AA:BB:CC:DD:EE:FF' },
            ]);
            return;
        }

        setIsScanning(true);
        try {
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { listDevices: () => Promise<{ devices: BluetoothDevice[] }> } };
            const { BluetoothPrinter } = plugin;
            const { devices: found } = await BluetoothPrinter.listDevices();
            setDevices(found || []);
        } catch (error) {
            console.error('Scan failed:', error);
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
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { connect: (opts: { address: string }) => Promise<void> } };
            const { BluetoothPrinter } = plugin;
            await BluetoothPrinter.connect({ address: device.address });
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
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { disconnect: () => Promise<void> } };
            const { BluetoothPrinter } = plugin;
            await BluetoothPrinter.disconnect();
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
