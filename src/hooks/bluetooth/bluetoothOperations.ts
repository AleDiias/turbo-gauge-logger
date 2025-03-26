
import { BleClient, ScanResult } from "@capacitor-community/bluetooth-le";
import { toast } from "@/components/ui/use-toast";
import { Capacitor } from '@capacitor/core';

// Initialize Bluetooth
export const initializeBluetooth = async (): Promise<boolean> => {
  try {
    await BleClient.initialize();
    toast({
      title: "Bluetooth Inicializado",
      description: "Bluetooth está pronto para uso",
    });
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Bluetooth:', error);
    toast({
      title: "Erro de Bluetooth",
      description: "Falha ao inicializar Bluetooth",
      variant: "destructive",
    });
    return false;
  }
};

// Start a real Bluetooth scan
export const startBluetoothScan = async (
  setIsScanning: (value: boolean) => void,
  setDevices: (devices: ScanResult[] | ((prev: ScanResult[]) => ScanResult[])) => void
): Promise<void> => {
  try {
    setIsScanning(true);
    setDevices([]);
    
    await BleClient.requestLEScan(
      {
        services: [], // Procurar por todos os serviços
        namePrefix: 'ELM', // Procurar por dispositivos com "ELM" no nome
        allowDuplicates: false,
      },
      (result) => {
        setDevices((prevDevices) => {
          // Verificar se o dispositivo já existe na lista
          const exists = prevDevices.some(
            (device) => device.device.deviceId === result.device.deviceId
          );
          
          if (!exists) {
            return [...prevDevices, result];
          }
          return prevDevices;
        });
      }
    );

    // Parar a busca após 10 segundos
    setTimeout(async () => {
      try {
        await BleClient.stopLEScan();
        setIsScanning(false);
        toast({
          title: "Busca Concluída",
          description: `Encontrado(s) dispositivos`,
        });
      } catch (error) {
        console.error('Erro ao parar a busca:', error);
      }
    }, 10000);
  } catch (error) {
    console.error('Erro ao iniciar a busca:', error);
    setIsScanning(false);
    toast({
      title: "Erro na Busca",
      description: "Falha ao iniciar a busca por dispositivos",
      variant: "destructive",
    });
  }
};

// Connect to a real Bluetooth device
export const connectToBluetoothDevice = async (
  device: ScanResult,
  setConnectedDevice: (device: ScanResult | null) => void
): Promise<void> => {
  try {
    await BleClient.connect(device.device.deviceId);
    setConnectedDevice(device);
    toast({
      title: "Conectado",
      description: `Conectado a ${device.device.name || device.device.deviceId}`,
    });
  } catch (error) {
    console.error('Erro ao conectar ao dispositivo:', error);
    toast({
      title: "Erro de Conexão",
      description: "Falha ao conectar ao dispositivo",
      variant: "destructive",
    });
  }
};

// Disconnect from a real Bluetooth device
export const disconnectFromBluetoothDevice = async (
  deviceId: string,
  setConnectedDevice: (device: ScanResult | null) => void
): Promise<void> => {
  try {
    await BleClient.disconnect(deviceId);
    setConnectedDevice(null);
    toast({
      title: "Desconectado",
      description: "Dispositivo desconectado com sucesso",
    });
  } catch (error) {
    console.error('Erro ao desconectar do dispositivo:', error);
    toast({
      title: "Erro de Desconexão",
      description: "Falha ao desconectar do dispositivo",
      variant: "destructive",
    });
  }
};

// Check if we're in a browser environment
export const checkBluetoothEnvironment = async (): Promise<boolean> => {
  try {
    // Check if running in native platform (not a browser)
    if (Capacitor.isNativePlatform()) {
      console.log('Running on native platform, using real Bluetooth');
      return false; // Not a simulation environment
    }
    
    // Additional web browser check
    if (typeof navigator !== 'undefined' && 
        navigator.bluetooth && 
        navigator.bluetooth.getAvailability && 
        await navigator.bluetooth.getAvailability()) {
      console.log('Running in browser with Web Bluetooth support');
      return false; // Web Bluetooth is available
    }
    
    console.log('Running in browser without Bluetooth support, using simulation');
    return true; // Use simulation mode
  } catch (error) {
    console.log('Error checking Bluetooth environment, defaulting to simulation mode:', error);
    return true; // Default to simulation mode on error
  }
};

// Clean up Bluetooth connections
export const cleanupBluetoothConnection = async (deviceId: string | null): Promise<void> => {
  if (!deviceId) return;
  
  try {
    await BleClient.disconnect(deviceId);
  } catch (error) {
    console.error('Erro ao desconectar:', error);
  }
};
