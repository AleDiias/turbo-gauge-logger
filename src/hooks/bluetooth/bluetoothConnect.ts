
import { BleClient, ScanResult } from "@capacitor-community/bluetooth-le";
import { toast } from "@/components/ui/use-toast";
import OBDService from '@/services/OBDService';

// Connect to a real Bluetooth device
export const connectToBluetoothDevice = async (
  device: ScanResult,
  setConnectedDevice: (device: ScanResult | null) => void,
  setIsScanning: (value: boolean) => void
): Promise<void> => {
  try {
    // Garantir que o scanning seja interrompido
    try {
      await BleClient.stopLEScan();
    } catch (e) {
      console.log('Scanning já estava parado');
    }
    setIsScanning(false);

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
    
    console.log(`Tentando conectar ao dispositivo: ${device.device.name || device.device.deviceId}`);
    
    // Definir o callback de desconexão para tentar reconectar automaticamente
    await BleClient.connect(device.device.deviceId, (deviceId) => {
      console.log(`Dispositivo desconectado: ${deviceId}, tentando reconectar...`);
      
      // Não atualizar o estado de conexão imediatamente, tentar reconectar primeiro
      setTimeout(() => {
        // Use o device original para tentar reconectar
        tryAutoReconnect(device, setConnectedDevice, setIsScanning);
      }, 1000);
    });
    
    console.log(`Conectado com sucesso ao dispositivo: ${device.device.name || device.device.deviceId}`);
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
    setIsScanning(false);
    toast({
      title: "Erro na Conexão",
      description: "Não foi possível conectar ao dispositivo. Tente novamente.",
      variant: "destructive",
    });
  }
};

// Try to reconnect to the last connected device
export const tryAutoReconnect = async (
  device: ScanResult,
  setConnectedDevice: (device: ScanResult | null) => void,
  setIsScanning: (value: boolean) => void
): Promise<void> => {
  try {
    // Garantir que o scanning seja interrompido
    try {
      await BleClient.stopLEScan();
    } catch (e) {
      console.log('Scanning já estava parado');
    }
    setIsScanning(false);

    console.log('Tentando reconectar a:', device.device.name || device.device.deviceId);
    
    // Verificar se o Bluetooth está habilitado
    const isEnabled = await BleClient.isEnabled().catch(() => false);
    if (!isEnabled) {
      console.log('Bluetooth não está habilitado, não é possível reconectar');
      return;
    }
    
    // Tentar conectar diretamente sem requestDevice
    try {
      await BleClient.connect(device.device.deviceId, (deviceId) => {
        console.log(`Dispositivo desconectado novamente: ${deviceId}`);
        
        // Tentar reconectar novamente quando desconectar
        setTimeout(() => {
          tryAutoReconnect(device, setConnectedDevice, setIsScanning);
        }, 2000);
      });
      
      console.log('Reconectado com sucesso!');
      setConnectedDevice(device);
      
      toast({
        title: "Reconectado",
        description: `Reconectado a ${device.device.name || device.device.deviceId}`,
      });
    } catch (error) {
      console.error('Erro ao reconectar diretamente:', error);
      console.log('Tentando método alternativo de reconexão...');
      
      // Se falhar a conexão direta, tentar o método alternativo com requestDevice
      try {
        // Este método só funciona em algumas plataformas
        const isAvailable = await BleClient.requestDevice({
          services: [],
          optionalServices: [],
          namePrefix: device.device.name || undefined,
        }).then(() => true).catch(() => false);
        
        if (!isAvailable) {
          console.log('Dispositivo não está disponível para reconexão');
          return;
        }
        
        await BleClient.connect(device.device.deviceId, (deviceId) => {
          console.log(`Dispositivo desconectado: ${deviceId}`);
          setTimeout(() => {
            tryAutoReconnect(device, setConnectedDevice, setIsScanning);
          }, 2000);
        });
        
        setConnectedDevice(device);
        toast({
          title: "Reconectado",
          description: `Reconectado a ${device.device.name || device.device.deviceId}`,
        });
      } catch (secondError) {
        console.error('Falha no método alternativo de reconexão:', secondError);
      }
    }
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
    console.log(`Desconectando do dispositivo: ${deviceId}`);
    
    // First disconnect OBD service
    try {
      console.log('Desconectando serviço OBD');
      await OBDService.disconnect();
      console.log('Serviço OBD desconectado com sucesso');
    } catch (obdError) {
      console.error('Erro ao desconectar serviço OBD:', obdError);
      // Continue with BLE disconnect even if OBD disconnect fails
    }
    
    // Then disconnect BLE
    await BleClient.disconnect(deviceId);
    console.log('Dispositivo Bluetooth desconectado com sucesso');
    
    setConnectedDevice(null);
    
    // Limpar o dispositivo salvo ao desconectar explicitamente
    localStorage.removeItem('lastConnectedDeviceId');
    localStorage.removeItem('lastConnectedDevice');
    localStorage.removeItem('connectedDevice');
    
    toast({
      title: "Desconectado",
      description: "Dispositivo desconectado com sucesso",
    });
  } catch (error) {
    console.error('Erro ao desconectar do dispositivo:', error);
    
    // Force clean state even if disconnect failed
    setConnectedDevice(null);
    localStorage.removeItem('lastConnectedDeviceId');
    localStorage.removeItem('lastConnectedDevice');
    localStorage.removeItem('connectedDevice');
    
    toast({
      title: "Erro de Desconexão",
      description: "Falha ao desconectar do dispositivo",
      variant: "destructive",
    });
  }
};
