import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Device {
  deviceId: string;
  name: string;
  rssi: number;
  isELM327: boolean;
}

export function BluetoothScanner() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const isELM327Device = (device: any): boolean => {
    // Verifica se o nome do dispositivo contém "ELM327" ou "OBDII"
    const name = device.name?.toLowerCase() || '';
    return name.includes('elm327') || name.includes('obdii');
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      setDevices([]);

      // Verifica se o Bluetooth está habilitado
      const isEnabled = await BluetoothLe.isEnabled();
      if (!isEnabled) {
        toast({
          title: "Bluetooth Desativado",
          description: "Por favor, ative o Bluetooth nas configurações do seu dispositivo.",
          variant: "destructive",
        });
        return;
      }

      // Inicia a descoberta de dispositivos
      await BluetoothLe.startLEScan({
        allowDuplicates: true,
        scanMode: 2, // SCAN_MODE_LOW_LATENCY
      });

      // Listener para dispositivos descobertos
      BluetoothLe.addListener('discovered', (result) => {
        const device = result.device;
        if (device) {
          setDevices(prevDevices => {
            // Evita duplicatas
            if (prevDevices.some(d => d.deviceId === device.deviceId)) {
              return prevDevices;
            }
            return [...prevDevices, {
              deviceId: device.deviceId,
              name: device.name || 'Dispositivo Desconhecido',
              rssi: device.rssi || 0,
              isELM327: isELM327Device(device)
            }];
          });
        }
      });

      // Listener para erros
      BluetoothLe.addListener('scanFailed', (error) => {
        console.error('Erro na varredura:', error);
        toast({
          title: "Erro na Varredura",
          description: "Não foi possível realizar a varredura de dispositivos.",
          variant: "destructive",
        });
      });

    } catch (error) {
      console.error('Erro ao iniciar varredura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a varredura de dispositivos.",
        variant: "destructive",
      });
    }
  };

  const stopScan = async () => {
    try {
      await BluetoothLe.stopLEScan();
      setIsScanning(false);
    } catch (error) {
      console.error('Erro ao parar varredura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível parar a varredura de dispositivos.",
        variant: "destructive",
      });
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      if (!device.isELM327) {
        toast({
          title: "Dispositivo não compatível",
          description: "Este dispositivo não é um ELM327. Por favor, selecione um dispositivo ELM327 ou OBDII.",
          variant: "destructive",
        });
        return;
      }

      await BluetoothLe.connect({
        deviceId: device.deviceId,
        timeout: 10000,
      });

      toast({
        title: "Conectado",
        description: `Conectado com sucesso ao dispositivo ${device.name}`,
      });

      // Aqui você pode adicionar a lógica para iniciar a comunicação com o dispositivo
      // Por exemplo, enviar comandos de inicialização

    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao dispositivo.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Scanner Bluetooth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={isScanning ? stopScan : startScan}
            className="w-full"
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Escaneando...
              </>
            ) : (
              'Iniciar Varredura'
            )}
          </Button>

          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {devices.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {isScanning
                  ? 'Procurando dispositivos...'
                  : 'Nenhum dispositivo encontrado'}
              </p>
            ) : (
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => connectToDevice(device)}
                  >
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Força do sinal: {device.rssi} dBm
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.isELM327 ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ELM327
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Outro
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 