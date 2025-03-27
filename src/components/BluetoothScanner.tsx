import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { useToast } from "@/components/ui/use-toast";

interface Device {
  deviceId: string;
  name: string;
  rssi: number;
  isELM327: boolean;
}

export function BluetoothScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { connect, disconnect, isConnected, deviceId } = useBluetoothStore();
  const { toast } = useToast();

  const isELM327Device = (name: string): boolean => {
    const elm327Identifiers = ['ELM327', 'OBDII', 'OBD2', 'OBD-II'];
    return elm327Identifiers.some(identifier => 
      name.toLowerCase().includes(identifier.toLowerCase())
    );
  };

  const initializeBluetooth = async () => {
    try {
      setIsInitializing(true);
      const isEnabled = await BluetoothLe.isEnabled();
      
      if (!isEnabled) {
        toast({
          title: "Bluetooth Desativado",
          description: "Por favor, ative o Bluetooth nas configurações do seu dispositivo.",
          variant: "destructive",
        });
        return;
      }

      await BluetoothLe.initialize();
      setIsInitialized(true);
      console.log('Bluetooth inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Bluetooth:', error);
      toast({
        title: "Erro de Inicialização",
        description: "Não foi possível inicializar o Bluetooth. Verifique se o Bluetooth está ativado.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeBluetooth();
    return () => {
      if (isScanning) {
        stopScan();
      }
    };
  }, []);

  const startScan = async () => {
    if (!isInitialized) {
      toast({
        title: "Bluetooth não inicializado",
        description: "Aguarde a inicialização do Bluetooth ou tente novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScanning(true);
      setDevices([]);
      
      await BluetoothLe.requestLEScan({
        allowDuplicates: true,
        scanMode: 2,
      });

      BluetoothLe.addListener('discovered', (result) => {
        const device = result.device;
        if (device.name && !devices.some(d => d.deviceId === device.deviceId)) {
          const isELM327 = isELM327Device(device.name);
          setDevices(prev => [...prev, {
            deviceId: device.deviceId,
            name: device.name,
            rssi: device.rssi || 0,
            isELM327
          }]);
        }
      });

      toast({
        title: "Busca Iniciada",
        description: "Procurando por dispositivos ELM327...",
      });
    } catch (error) {
      console.error('Erro ao iniciar scan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a busca por dispositivos.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScan = async () => {
    try {
      await BluetoothLe.stopLEScan();
      setIsScanning(false);
      
      if (devices.length === 0) {
        toast({
          title: "Busca Concluída",
          description: "Nenhum dispositivo ELM327 encontrado.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Busca Concluída",
          description: `${devices.length} dispositivo(s) encontrado(s).`,
        });
      }
    } catch (error) {
      console.error('Erro ao parar scan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível parar a busca por dispositivos.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (device: Device) => {
    if (!device.isELM327) {
      toast({
        title: "Dispositivo Incompatível",
        description: "Este dispositivo não é um ELM327. Por favor, selecione um dispositivo ELM327.",
        variant: "destructive",
      });
      return;
    }

    try {
      await connect(device.deviceId, device.name);
      toast({
        title: "Conectado",
        description: `Conectado ao dispositivo ${device.name}`,
      });
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao dispositivo.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Desconectado",
        description: "Dispositivo desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar do dispositivo.",
        variant: "destructive",
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Inicializando Bluetooth...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button 
          onClick={isScanning ? stopScan : startScan}
          disabled={isConnected || !isInitialized}
        >
          {isScanning ? 'Parar Busca' : 'Buscar Dispositivos'}
        </Button>
        {isConnected && (
          <Button 
            onClick={handleDisconnect}
            variant="destructive"
          >
            Desconectar
          </Button>
        )}
      </div>

      <Card className="p-4">
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className={`p-4 rounded-lg border ${
                  device.isELM327 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{device.name}</h3>
                    <p className="text-sm text-gray-500">
                      {device.isELM327 ? 'Dispositivo ELM327' : 'Dispositivo não compatível'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Força do sinal: {device.rssi} dBm
                    </p>
                  </div>
                  {device.isELM327 && (
                    <Button
                      onClick={() => handleConnect(device)}
                      disabled={isConnected}
                    >
                      {deviceId === device.deviceId ? 'Conectado' : 'Conectar'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!isScanning && devices.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Nenhum dispositivo encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
} 