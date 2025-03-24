
import { useState, useEffect } from 'react';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { toast } from "@/components/ui/use-toast";

export const useBluetooth = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);

  useEffect(() => {
    const initializeBluetooth = async () => {
      try {
        await BleClient.initialize();
        toast({
          title: "Bluetooth Inicializado",
          description: "Bluetooth está pronto para uso",
        });
      } catch (error) {
        console.error('Erro ao inicializar Bluetooth:', error);
        toast({
          title: "Erro de Bluetooth",
          description: "Falha ao inicializar Bluetooth",
          variant: "destructive",
        });
      }
    };

    initializeBluetooth();

    return () => {
      // Função de limpeza
      const cleanup = async () => {
        try {
          if (connectedDevice) {
            await BleClient.disconnect(connectedDevice.device.deviceId);
          }
        } catch (error) {
          console.error('Erro ao desconectar:', error);
        }
      };
      
      cleanup();
    };
  }, [connectedDevice]);

  const startScan = async () => {
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
            description: `Encontrado(s) ${devices.length} dispositivo(s)`,
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

  const connectToDevice = async (device: ScanResult) => {
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

  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    
    try {
      await BleClient.disconnect(connectedDevice.device.deviceId);
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

  return {
    isScanning,
    devices,
    connectedDevice,
    startScan,
    connectToDevice,
    disconnectDevice
  };
};
