import { useState, useEffect } from 'react';
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
  cleanupBluetoothConnection,
  tryAutoReconnect
} from './bluetooth/bluetoothOperations';

export const useBluetooth = (): BluetoothHook => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);
  const [lastConnectedDevice, setLastConnectedDevice] = useState<ScanResult | null>(null);

  // Efeito para inicialização e limpeza
  useEffect(() => {
    const setup = async () => {
      const isSimulated = await checkBluetoothEnvironment();
      setIsBrowserEnvironment(isSimulated);
      
      if (!isSimulated) {
        await initializeBluetooth();
        
        const savedDeviceJson = localStorage.getItem('lastConnectedDevice');
        if (savedDeviceJson) {
          try {
            const device = JSON.parse(savedDeviceJson) as ScanResult;
            setLastConnectedDevice(device);
            console.log('Tentando reconectar ao último dispositivo:', device.device.name || device.device.deviceId);
            tryAutoReconnect(device, setConnectedDevice, setIsScanning);
          } catch (e) {
            console.error('Erro ao restaurar o último dispositivo:', e);
          }
        }
      }
    };
    
    setup();

    return () => {
      if (!window.__bluetoothManagerMounted && !isBrowserEnvironment && connectedDevice) {
        console.log('Componente completamente desmontado, desconectando Bluetooth');
        cleanupBluetoothConnection(connectedDevice.device.deviceId);
      }
    };
  }, [connectedDevice, isBrowserEnvironment]);

  // Efeito para gerenciar o estado de conexão
  useEffect(() => {
    if (connectedDevice) {
      setLastConnectedDevice(connectedDevice);
      setIsScanning(false);
      setDevices([]); // Limpar lista de dispositivos quando conectado
      try {
        localStorage.setItem('lastConnectedDevice', JSON.stringify(connectedDevice));
      } catch (e) {
        console.error('Erro ao salvar dispositivo conectado:', e);
      }
    }
  }, [connectedDevice]);

  // Efeito para parar o scanning quando um dispositivo for conectado
  useEffect(() => {
    if (connectedDevice && isScanning) {
      const stopScan = async () => {
        try {
          await BleClient.stopLEScan();
        } catch (e) {
          console.log('Scanning já estava parado');
        }
        setIsScanning(false);
      };
      stopScan();
    }
  }, [connectedDevice, isScanning]);

  const startScan = async () => {
    if (connectedDevice) return; // Não iniciar scan se já estiver conectado
    
    if (isBrowserEnvironment) {
      simulateScan(setIsScanning, setDevices);
      return;
    }
    
    await startBluetoothScan(setIsScanning, setDevices);
  };

  const connectToDevice = async (device: ScanResult) => {
    if (connectedDevice) return; // Não conectar se já estiver conectado
    
    if (isBrowserEnvironment) {
      simulateConnection(device, setConnectedDevice);
      setIsScanning(false);
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
    setIsScanning(false);
    setDevices([]); // Limpar lista de dispositivos ao desconectar
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
