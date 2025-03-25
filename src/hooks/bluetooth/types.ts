
import { ScanResult } from '@capacitor-community/bluetooth-le';

// Define a simplified ScanResult type for simulation
export type SimplifiedScanResult = {
  device: {
    deviceId: string;
    name?: string;
  };
  rssi: number;
  txPower?: number;
  manufacturerData: { [key: string]: DataView };
  serviceData: { [key: string]: DataView };
  serviceUUIDs: string[];
  localName?: string;
  rawAdvertisement: DataView;
};

export interface BluetoothHookState {
  isScanning: boolean;
  devices: ScanResult[];
  connectedDevice: ScanResult | null;
  isBrowserEnvironment: boolean;
}

export interface BluetoothHookActions {
  startScan: () => Promise<void>;
  connectToDevice: (device: ScanResult) => Promise<void>;
  disconnectDevice: () => Promise<void>;
}

export type BluetoothHook = BluetoothHookState & BluetoothHookActions;
