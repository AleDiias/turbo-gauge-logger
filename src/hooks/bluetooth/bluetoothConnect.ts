
import { BleClient, ScanResult } from "@capacitor-community/bluetooth-le";
import { toast } from "@/components/ui/use-toast";

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
