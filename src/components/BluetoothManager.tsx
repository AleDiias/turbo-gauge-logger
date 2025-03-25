
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircled } from "lucide-react";
import { useBluetooth } from '@/hooks/useBluetooth';
import ConnectedDeviceCard from './bluetooth/ConnectedDeviceCard';
import DevicesList from './bluetooth/DevicesList';
import ScanningStatus from './bluetooth/ScanningStatus';

const BluetoothManager: React.FC = () => {
  const { 
    isScanning, 
    devices, 
    connectedDevice, 
    isBrowserEnvironment,
    startScan, 
    connectToDevice, 
    disconnectDevice 
  } = useBluetooth();

  return (
    <div className="space-y-4">
      {isBrowserEnvironment && (
        <Alert variant="info" className="bg-blue-500/10 border-blue-500/30 text-foreground">
          <InfoCircled className="size-4" />
          <AlertTitle>Modo de Simulação</AlertTitle>
          <AlertDescription>
            O acesso Bluetooth completo não está disponível no navegador. 
            Executando em modo de simulação com dispositivos de exemplo.
            Para funcionalidade completa, execute o aplicativo em um dispositivo móvel com Capacitor.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Conexão Bluetooth</h2>
        {!isScanning ? (
          <Button onClick={startScan} disabled={isScanning}>
            Buscar Dispositivos
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Buscando...
          </Button>
        )}
      </div>

      {connectedDevice && (
        <ConnectedDeviceCard 
          device={connectedDevice} 
          onDisconnect={disconnectDevice} 
        />
      )}

      {devices.length > 0 && !connectedDevice && (
        <DevicesList devices={devices} onConnect={connectToDevice} />
      )}

      <ScanningStatus isScanning={isScanning} devicesCount={devices.length} />
    </div>
  );
};

export default BluetoothManager;
