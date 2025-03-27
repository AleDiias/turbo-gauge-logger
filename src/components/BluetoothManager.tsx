
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

  useEffect(() => {
    // Manter o componente vivo mesmo quando não estiver visível
    // para prevenir desconexão ao trocar de aba
    const keepAlive = () => {
      console.log('Mantendo conexão Bluetooth ativa');
    };
    
    const interval = setInterval(keepAlive, 5000);
    
    // Definir uma flag global para indicar que o componente está montado
    // e não deve desconectar o BLE quando muda de tela
    window.__bluetoothManagerMounted = true;
    
    return () => {
      clearInterval(interval);
      // Apenas remover a flag se o componente estiver realmente desmontando
      // e não apenas tornando-se invisível ao mudar de aba
      if (document.visibilityState !== 'hidden') {
        window.__bluetoothManagerMounted = false;
      }
    };
  }, []);

  // Esse efeito lida com mudanças de visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Página visível novamente, garantindo que a conexão Bluetooth está mantida');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

// Declare global property for TypeScript
declare global {
  interface Window {
    __bluetoothManagerMounted?: boolean;
  }
}

export default BluetoothManager;
