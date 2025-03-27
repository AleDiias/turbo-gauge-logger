
import { BleClient, ScanResult } from "@capacitor-community/bluetooth-le";
import { toast } from "@/components/ui/use-toast";

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
