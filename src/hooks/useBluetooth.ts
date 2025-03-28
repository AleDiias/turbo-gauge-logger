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
  cleanupBluetoothConnection,
  tryAutoReconnect
} from './bluetooth/bluetoothOperations';

export const useBluetooth = (): BluetoothHook => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);
  const [lastConnectedDevice, setLastConnectedDevice] = useState<ScanResult | null>(null);

  // Função para forçar parada do scanning
  const forceStopScan = useCallback(async () => {
    try {
      await BleClient.stopLEScan();
    } catch (e) {
      console.log('Scanning já estava parado');
    }
    setIsScanning(false);
  }, []);

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
            await tryAutoReconnect(device, setConnectedDevice, setIsScanning);
          } catch (e) {
            console.error('Erro ao restaurar o último dispositivo:', e);
          }
        }
      }
    };
    
    setup();

    // Não desconectar ao sair da aplicação
    return () => {
      if (connectedDevice) {
        console.log('Mantendo conexão Bluetooth ativa');
      }
    };
  }, []);

  // Efeito para gerenciar o estado de conexão
  useEffect(() => {
    if (connectedDevice) {
      setLastConnectedDevice(connectedDevice);
      forceStopScan(); // Garantir que o scanning seja interrompido
      setDevices([]); // Limpar lista de dispositivos quando conectado
      try {
        localStorage.setItem('lastConnectedDevice', JSON.stringify(connectedDevice));
      } catch (e) {
        console.error('Erro ao salvar dispositivo conectado:', e);
      }
    }
  }, [connectedDevice, forceStopScan]);

  // Efeito para parar o scanning quando um dispositivo for conectado
  useEffect(() => {
    if (connectedDevice && isScanning) {
      forceStopScan();
    }
  }, [connectedDevice, isScanning, forceStopScan]);

  // Efeito para manter a conexão ao mudar de aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectedDevice) {
        console.log('Página visível novamente, verificando conexão Bluetooth');
        tryAutoReconnect(connectedDevice, setConnectedDevice, setIsScanning);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectedDevice]);

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
