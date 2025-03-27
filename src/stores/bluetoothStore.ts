import { create } from 'zustand';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';

interface BluetoothState {
  isConnected: boolean;
  deviceId: string | null;
  deviceName: string | null;
  connect: (deviceId: string, deviceName: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useBluetoothStore = create<BluetoothState>((set) => ({
  isConnected: false,
  deviceId: null,
  deviceName: null,
  connect: async (deviceId: string, deviceName: string) => {
    try {
      await BluetoothLe.connect({
        deviceId,
        timeout: 10000,
      });

      set({
        isConnected: true,
        deviceId,
        deviceName,
      });
    } catch (error) {
      console.error('Erro ao conectar:', error);
      throw error;
    }
  },
  disconnect: async () => {
    try {
      if (useBluetoothStore.getState().deviceId) {
        await BluetoothLe.disconnect({
          deviceId: useBluetoothStore.getState().deviceId!,
        });
      }

      set({
        isConnected: false,
        deviceId: null,
        deviceName: null,
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      throw error;
    }
  },
})); 