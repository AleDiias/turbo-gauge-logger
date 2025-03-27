
import { useState, useEffect } from 'react';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { BluetoothHook } from './bluetooth/types';
import { 
  simulateScan, 
  simulateConnection, 
  simulateDisconnection 
} from './bluetooth/simulationUtils';
import { 
  initializeBluetooth,
  startBluetoothScan,
  connectToBluetoothDevice,
  disconnectFromBluetoothDevice,
  checkBluetoothEnvironment,
  cleanupBluetoothConnection,
  tryAutoReconnect
} from './bluetooth/bluetoothOperations';

export const useBluetooth = (): BluetoothHook => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);
  const [lastConnectedDevice, setLastConnectedDevice] = useState<ScanResult | null>(null);

  useEffect(() => {
    // Check environment and initialize Bluetooth
    const setup = async () => {
      const isSimulated = await checkBluetoothEnvironment();
      setIsBrowserEnvironment(isSimulated);
      
      if (!isSimulated) {
        await initializeBluetooth();
        
        // Tentar reconectar ao último dispositivo
        if (lastConnectedDevice) {
          console.log('Tentando reconectar ao último dispositivo:', lastConnectedDevice.device.name || lastConnectedDevice.device.deviceId);
          tryAutoReconnect(lastConnectedDevice, setConnectedDevice);
        }
      }
    };
    
    setup();

    // Não faça limpeza ao mudar de aba, apenas ao desmontar o componente completamente
    return () => {
      if (!isBrowserEnvironment && connectedDevice) {
        // Desconectar apenas se o app estiver fechando, não quando mudar de aba
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            // Não desconectar quando o app for para background
            console.log('App em background, mantendo conexão');
          }
        });
      }
    };
  }, [connectedDevice, isBrowserEnvironment, lastConnectedDevice]);

  // Atualizar o último dispositivo conectado quando houver uma conexão
  useEffect(() => {
    if (connectedDevice) {
      setLastConnectedDevice(connectedDevice);
    }
  }, [connectedDevice]);

  const startScan = async () => {
    if (isBrowserEnvironment) {
      simulateScan(setIsScanning, setDevices);
      return;
    }
    
    await startBluetoothScan(setIsScanning, setDevices);
  };

  const connectToDevice = async (device: ScanResult) => {
    if (isBrowserEnvironment) {
      simulateConnection(device, setConnectedDevice);
      return;
    }
    
    await connectToBluetoothDevice(device, setConnectedDevice);
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    
    if (isBrowserEnvironment) {
      simulateDisconnection(setConnectedDevice);
      return;
    }
    
    await disconnectFromBluetoothDevice(connectedDevice.device.deviceId, setConnectedDevice);
  };

  return {
    isScanning,
    devices,
    connectedDevice,
    isBrowserEnvironment,
    startScan,
    connectToDevice,
    disconnectDevice
  };
};
