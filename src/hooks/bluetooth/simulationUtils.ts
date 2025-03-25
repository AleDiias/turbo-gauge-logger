
import { toast } from "@/components/ui/use-toast";
import { SimplifiedScanResult } from "./types";
import { ScanResult } from "@capacitor-community/bluetooth-le";

// Create mock devices for browser simulation
export const createMockDevices = (): SimplifiedScanResult[] => {
  const emptyArrayBuffer = new ArrayBuffer(0);
  return [
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
};

// Simulate a Bluetooth scan
export const simulateScan = (
  setIsScanning: (value: boolean) => void,
  setDevices: (devices: ScanResult[]) => void
): void => {
  setIsScanning(true);
  setDevices([]);
  
  // Simulate scan delay
  setTimeout(() => {
    const mockDevices = createMockDevices();
    setDevices(mockDevices as unknown as ScanResult[]);
    setIsScanning(false);
    toast({
      title: "Busca Simulada Concluída",
      description: "Dispositivos de exemplo encontrados (modo de simulação)",
    });
  }, 2000);
};

// Simulate device connection
export const simulateConnection = (
  device: ScanResult,
  setConnectedDevice: (device: ScanResult | null) => void
): void => {
  setConnectedDevice(device);
  toast({
    title: "Conectado (Simulado)",
    description: `Conectado a ${device.device.name || device.device.deviceId} (modo de simulação)`,
  });
};

// Simulate device disconnection
export const simulateDisconnection = (
  setConnectedDevice: (device: ScanResult | null) => void
): void => {
  setConnectedDevice(null);
  toast({
    title: "Desconectado (Simulado)",
    description: "Dispositivo desconectado (modo de simulação)",
  });
};
