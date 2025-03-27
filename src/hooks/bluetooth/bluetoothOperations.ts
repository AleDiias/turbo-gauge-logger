
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
        
        // Verificar se algum dispositivo foi encontrado
        setDevices((prevDevices) => {
          if (prevDevices.length === 0) {
            toast({
              title: "Busca Concluída",
              description: "Nenhum dispositivo encontrado",
              variant: "default",
            });
          } else {
            toast({
              title: "Busca Concluída",
              description: `Encontrado(s) ${prevDevices.length} dispositivo(s)`,
            });
          }
          return prevDevices;
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
    // Verificar se o nome do dispositivo contém "ELM" ou "OBD" para identificar adaptadores OBD
    const deviceName = device.device.name || "";
    const isOBDAdapter = deviceName.includes("ELM") || 
                          deviceName.includes("OBD") || 
                          deviceName.includes("OBDII");
    
    if (!isOBDAdapter) {
      // Aviso para dispositivos que não parecem ser adaptadores OBD
      toast({
        title: "Aviso de Compatibilidade",
        description: "Este dispositivo pode não ser um adaptador OBD-II compatível. Deseja conectar mesmo assim?",
        variant: "default",
      });
    }
    
    await BleClient.connect(device.device.deviceId, (deviceId) => {
      console.log(`Dispositivo desconectado: ${deviceId}`);
      setConnectedDevice(null);
      
      // Tentar reconectar automaticamente quando desconectar inesperadamente
      setTimeout(() => {
        tryAutoReconnect(device, setConnectedDevice);
      }, 2000);
    });
    
    setConnectedDevice(device);
    
    // Salvar o dispositivo para auto-reconexão posterior
    localStorage.setItem('lastConnectedDeviceId', device.device.deviceId);
    try {
      localStorage.setItem('lastConnectedDevice', JSON.stringify(device));
    } catch (err) {
      console.error('Não foi possível salvar o dispositivo completo:', err);
    }
    
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

// Try to reconnect to the last connected device
export const tryAutoReconnect = async (
  device: ScanResult,
  setConnectedDevice: (device: ScanResult | null) => void
): Promise<void> => {
  try {
    console.log('Tentando reconectar a:', device.device.name || device.device.deviceId);
    
    // Verificar se o dispositivo ainda está disponível
    const isAvailable = await BleClient.requestDevice({
      services: [],
      optionalServices: [],
      namePrefix: device.device.name || undefined,
    }).then(() => true).catch(() => false);
    
    if (!isAvailable) {
      console.log('Dispositivo não está disponível para reconexão');
      return;
    }
    
    // Tentar conectar
    await BleClient.connect(device.device.deviceId, (deviceId) => {
      console.log(`Dispositivo desconectado: ${deviceId}`);
      setConnectedDevice(null);
      
      // Tentar reconectar novamente quando desconectar
      setTimeout(() => {
        tryAutoReconnect(device, setConnectedDevice);
      }, 2000);
    });
    
    setConnectedDevice(device);
    toast({
      title: "Reconectado",
      description: `Reconectado a ${device.device.name || device.device.deviceId}`,
    });
  } catch (error) {
    console.error('Erro ao reconectar ao dispositivo:', error);
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
    
    // Limpar o dispositivo salvo ao desconectar explicitamente
    localStorage.removeItem('lastConnectedDeviceId');
    localStorage.removeItem('lastConnectedDevice');
    
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
    // Não desconectar automaticamente ao limpar, apenas liberar recursos
    console.log('Limpando recursos Bluetooth, mas mantendo a conexão');
  } catch (error) {
    console.error('Erro ao limpar recursos Bluetooth:', error);
  }
};
