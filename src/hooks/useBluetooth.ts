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
  checkBluetoothEnvironment,
  tryAutoReconnect
} from './bluetooth/bluetoothOperations';

// Global state to maintain connection status across component mounts
let globalConnectedDevice: ScanResult | null = null;

export const useBluetooth = (): BluetoothHook => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(globalConnectedDevice);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);

  // Function to update both local and global connection state
  const updateConnectedDevice = useCallback((device: ScanResult | null) => {
    setConnectedDevice(device);
    globalConnectedDevice = device;
    
    // If device is connected, save to localStorage
    if (device) {
      try {
        localStorage.setItem('connectedDevice', JSON.stringify(device));
      } catch (e) {
        console.log('Erro ao salvar dispositivo conectado:', e);
      }
    } else {
      localStorage.removeItem('connectedDevice');
    }
  }, []);

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
    // First check if we have a global connection
    if (globalConnectedDevice) {
      setConnectedDevice(globalConnectedDevice);
      return;
    }
    
    try {
      const savedDevice = localStorage.getItem('connectedDevice');
      if (savedDevice) {
        const device = JSON.parse(savedDevice) as ScanResult;
        const isEnabled = await BleClient.isEnabled();
        
        if (isEnabled) {
          console.log('Dispositivo encontrado no localStorage, tentando reconectar:', device.device.name || device.device.deviceId);
          updateConnectedDevice(device);
          
          // Try to verify if the device is still connected
          try {
            // Check if already connected by trying to read a characteristic
            // This will throw if not connected
            await BleClient.connect(device.device.deviceId);
            console.log('Reconectado com sucesso ao dispositivo salvo');
          } catch (e) {
            console.log('Erro ao reconectar, tentando reconexão automática');
            // Attempt to reconnect
            tryAutoReconnect(device, updateConnectedDevice, setIsScanning);
          }
          return;
        }
      }
      updateConnectedDevice(null);
    } catch (e) {
      console.log('Erro ao verificar dispositivo conectado:', e);
      updateConnectedDevice(null);
    }
  }, [updateConnectedDevice]);

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
    
    // Cleanup on unmount
    return () => {
      // We don't disconnect on unmount anymore, we want to keep the connection
      console.log('Componente Bluetooth desmontado, mantendo conexão');
    };
  }, [checkConnectedDevice]);

  // Efeito para gerenciar o estado de conexão
  useEffect(() => {
    if (connectedDevice) {
      forceStopScan();
      setDevices([]);
    }
  }, [connectedDevice, forceStopScan]);

  // Efeito para verificar conexão ao voltar para o app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Aplicativo voltou para o primeiro plano, verificando conexão');
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
      simulateConnection(device, updateConnectedDevice);
      await forceStopScan();
      return;
    }
    
    await connectToBluetoothDevice(device, updateConnectedDevice, setIsScanning);
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    
    if (isBrowserEnvironment) {
      simulateDisconnection(updateConnectedDevice);
      return;
    }
    
    await disconnectFromBluetoothDevice(connectedDevice.device.deviceId, updateConnectedDevice);
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
