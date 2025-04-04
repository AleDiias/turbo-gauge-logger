
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Bluetooth } from "lucide-react";
import { useBluetooth } from '@/hooks/useBluetooth';
import { useOBDData } from '@/hooks/useOBDData';
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
  
  const { 
    isInitialized, 
    isInitializing, 
    initializationError 
  } = useOBDData();

  // Log connection status for debugging
  useEffect(() => {
    console.log('Estado de conexão Bluetooth:', connectedDevice ? 
      `Conectado a ${connectedDevice.device.name || connectedDevice.device.deviceId}` : 
      'Não conectado');
    console.log('OBD inicializado:', isInitialized ? 'Sim' : 'Não');
    console.log('OBD inicializando:', isInitializing ? 'Sim' : 'Não');
    console.log('Erro na inicialização:', initializationError ? 'Sim' : 'Não');
  }, [connectedDevice, isInitialized, isInitializing, initializationError]);

  // Renderização condicional dos componentes
  const renderDevicesList = () => {
    if (connectedDevice) return null;
    if (devices.length === 0) return null;
    return <DevicesList devices={devices} onConnect={connectToDevice} />;
  };

  const handleDisconnect = async () => {
    console.log('Iniciando desconexão via interface');
    await disconnectDevice();
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
        <h2 className="text-xl font-semibold flex items-center">
          <Bluetooth className="mr-2 h-5 w-5" />
          Conexão Bluetooth
        </h2>
        {!isScanning && !connectedDevice ? (
          <Button onClick={startScan} disabled={isScanning || !!connectedDevice}>
            Buscar Dispositivos
          </Button>
        ) : null}
      </div>

      {connectedDevice && (
        <ConnectedDeviceCard 
          device={connectedDevice} 
          onDisconnect={handleDisconnect} 
          isOBDInitialized={isInitialized}
          isInitializing={isInitializing}
          initializationError={initializationError}
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
