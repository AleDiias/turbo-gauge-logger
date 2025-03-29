
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
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

  // Log connection status for debugging
  useEffect(() => {
    console.log('Estado de conexão Bluetooth:', connectedDevice ? 
      `Conectado a ${connectedDevice.device.name || connectedDevice.device.deviceId}` : 
      'Não conectado');
  }, [connectedDevice]);

  // Renderização condicional dos componentes
  const renderDevicesList = () => {
    if (connectedDevice) return null;
    if (devices.length === 0) return null;
    return <DevicesList devices={devices} onConnect={connectToDevice} />;
  };

  return (
    <div className="space-y-4">
      {isBrowserEnvironment && (
        <Alert variant="default" className="bg-blue-500/10 border-blue-500/30 text-foreground">
          <Info className="size-4" />
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
        {!isScanning && !connectedDevice ? (
          <Button onClick={startScan} disabled={isScanning || !!connectedDevice}>
            Buscar Dispositivos
          </Button>
        ) : null}
      </div>

      {connectedDevice && (
        <ConnectedDeviceCard 
          device={connectedDevice} 
          onDisconnect={disconnectDevice} 
        />
      )}

      {renderDevicesList()}

      {!connectedDevice && (
        <ScanningStatus 
          isScanning={isScanning} 
          devicesCount={devices.length} 
          connectedDevice={connectedDevice}
        />
      )}
    </div>
  );
};

export default BluetoothManager;
