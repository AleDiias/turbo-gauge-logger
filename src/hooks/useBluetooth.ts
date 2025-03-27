
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
        const savedDeviceJson = localStorage.getItem('lastConnectedDevice');
        if (savedDeviceJson) {
          try {
            const device = JSON.parse(savedDeviceJson) as ScanResult;
            setLastConnectedDevice(device);
            console.log('Tentando reconectar ao último dispositivo:', device.device.name || device.device.deviceId);
            tryAutoReconnect(device, setConnectedDevice);
          } catch (e) {
            console.error('Erro ao restaurar o último dispositivo:', e);
          }
        }
      }
    };
    
    setup();

    // Não desconecte ao mudar de aba, apenas ao desmontar o componente completamente
    return () => {
      // Verificar se o componente BluetoothManager ainda está montado
      // ou se apenas a página está mudando de visibilidade
      if (!window.__bluetoothManagerMounted && !isBrowserEnvironment && connectedDevice) {
        console.log('Componente completamente desmontado, desconectando Bluetooth');
        cleanupBluetoothConnection(connectedDevice.device.deviceId);
      } else {
        console.log('Mantendo conexão Bluetooth ativa mesmo ao mudar de aba');
      }
    };
  }, [connectedDevice, isBrowserEnvironment, lastConnectedDevice]);

  // Atualizar o último dispositivo conectado quando houver uma conexão
  useEffect(() => {
    if (connectedDevice) {
      setLastConnectedDevice(connectedDevice);
      // Salvar no localStorage para autoconexão futura
      try {
        localStorage.setItem('lastConnectedDevice', JSON.stringify(connectedDevice));
      } catch (e) {
        console.error('Erro ao salvar dispositivo conectado:', e);
      }
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
