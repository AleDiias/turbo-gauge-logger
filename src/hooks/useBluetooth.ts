
import { useState, useEffect } from 'react';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { toast } from "@/components/ui/use-toast";

// Define a more compatible ScanResult type for our simulation
type SimplifiedScanResult = {
  device: {
    deviceId: string;
    name?: string;
  };
  rssi: number;
  txPower?: number;
  manufacturerData: { [key: string]: DataView };
  serviceData: { [key: string]: DataView };
  serviceUUIDs: string[];
  localName?: string;
  rawAdvertisement: DataView;
};

export const useBluetooth = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment without full Bluetooth capabilities
    const checkEnvironment = async () => {
      try {
        // This is a simple check to see if we're in a browser environment
        // In a mobile environment with Capacitor, this would be available
        if (typeof window !== 'undefined' && 
            (!navigator.bluetooth || 
             !navigator.bluetooth.getAvailability || 
             !(await navigator.bluetooth.getAvailability()))) {
          setIsBrowserEnvironment(true);
        }
      } catch (error) {
        console.log('Running in browser environment or Bluetooth not available');
        setIsBrowserEnvironment(true);
      }
    };

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
        setIsBrowserEnvironment(true);
      }
    };

    checkEnvironment();
    if (!isBrowserEnvironment) {
      initializeBluetooth();
    }

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
      
      if (!isBrowserEnvironment) {
        cleanup();
      }
    };
  }, [connectedDevice, isBrowserEnvironment]);

  const startScan = async () => {
    if (isBrowserEnvironment) {
      // Modo de simulação para desenvolvimento web
      setIsScanning(true);
      setDevices([]);
      
      // Simular alguns dispositivos após um pequeno atraso
      setTimeout(() => {
        const emptyArrayBuffer = new ArrayBuffer(0);
        const mockDevices: SimplifiedScanResult[] = [
          {
            device: {
              deviceId: "mock-elm327-1",
              name: "ELM327 OBD Scanner",
            },
            rssi: -70,
            txPower: undefined,
            manufacturerData: {},
            serviceData: {},
            serviceUUIDs: [],
            localName: "ELM327",
            rawAdvertisement: new DataView(emptyArrayBuffer),
          },
          {
            device: {
              deviceId: "mock-elm327-2",
              name: "ELM327 Bluetooth OBD2",
            },
            rssi: -65,
            txPower: undefined,
            manufacturerData: {},
            serviceData: {},
            serviceUUIDs: [],
            localName: "ELM327 BT",
            rawAdvertisement: new DataView(emptyArrayBuffer),
          }
        ];
        
        setDevices(mockDevices as unknown as ScanResult[]);
        setIsScanning(false);
        toast({
          title: "Busca Simulada Concluída",
          description: "Dispositivos de exemplo encontrados (modo de simulação)",
        });
      }, 2000);
      
      return;
    }
    
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
    if (isBrowserEnvironment) {
      // Simular conexão em modo de desenvolvimento web
      setConnectedDevice(device);
      toast({
        title: "Conectado (Simulado)",
        description: `Conectado a ${device.device.name || device.device.deviceId} (modo de simulação)`,
      });
      return;
    }
    
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
    
    if (isBrowserEnvironment) {
      // Simular desconexão em modo de desenvolvimento web
      setConnectedDevice(null);
      toast({
        title: "Desconectado (Simulado)",
        description: "Dispositivo desconectado (modo de simulação)",
      });
      return;
    }
    
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
    isBrowserEnvironment,
    startScan,
    connectToDevice,
    disconnectDevice
  };
};
