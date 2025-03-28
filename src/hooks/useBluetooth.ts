import { useState, useEffect, useCallback } from 'react';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
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
  checkBluetoothEnvironment
} from './bluetooth/bluetoothOperations';

export const useBluetooth = (): BluetoothHook => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);

  // Função para forçar parada do scanning
  const forceStopScan = useCallback(async () => {
    try {
      await BleClient.stopLEScan();
    } catch (e) {
      console.log('Scanning já estava parado');
    }
    setIsScanning(false);
  }, []);

  // Função para verificar dispositivo conectado
  const checkConnectedDevice = useCallback(async () => {
    try {
      const savedDevice = localStorage.getItem('connectedDevice');
      if (savedDevice) {
        const device = JSON.parse(savedDevice) as ScanResult;
        const isEnabled = await BleClient.isEnabled();
        
        if (isEnabled) {
          setConnectedDevice(device);
          return;
        }
      }
      setConnectedDevice(null);
    } catch (e) {
      console.log('Erro ao verificar dispositivo conectado:', e);
      setConnectedDevice(null);
    }
  }, []);

  // Efeito para inicialização
  useEffect(() => {
    const setup = async () => {
      const isSimulated = await checkBluetoothEnvironment();
      setIsBrowserEnvironment(isSimulated);
      
      if (!isSimulated) {
        await initializeBluetooth();
        await checkConnectedDevice();
      }
    };
    
    setup();
  }, [checkConnectedDevice]);

  // Efeito para gerenciar o estado de conexão
  useEffect(() => {
    if (connectedDevice) {
      forceStopScan();
      setDevices([]);
      // Salvar dispositivo conectado
      try {
        localStorage.setItem('connectedDevice', JSON.stringify(connectedDevice));
      } catch (e) {
        console.log('Erro ao salvar dispositivo conectado:', e);
      }
    }
  }, [connectedDevice, forceStopScan]);

  // Efeito para verificar conexão ao voltar para o app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkConnectedDevice();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkConnectedDevice]);

  const startScan = async () => {
    if (connectedDevice) {
      await forceStopScan();
      return;
    }
    
    if (isBrowserEnvironment) {
      simulateScan(setIsScanning, setDevices);
      return;
    }
    
    await startBluetoothScan(setIsScanning, setDevices);
  };

  const connectToDevice = async (device: ScanResult) => {
    if (connectedDevice) return;
    
    if (isBrowserEnvironment) {
      simulateConnection(device, setConnectedDevice);
      await forceStopScan();
      return;
    }
    
    await connectToBluetoothDevice(device, setConnectedDevice, setIsScanning);
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    
    if (isBrowserEnvironment) {
      simulateDisconnection(setConnectedDevice);
      return;
    }
    
    await disconnectFromBluetoothDevice(connectedDevice.device.deviceId, setConnectedDevice);
    await forceStopScan();
    setDevices([]);
    // Limpar dispositivo salvo
    localStorage.removeItem('connectedDevice');
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
