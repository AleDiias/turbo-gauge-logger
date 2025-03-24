
import React from 'react';
import { Button } from "@/components/ui/button";
import { useBluetooth } from '@/hooks/useBluetooth';
import ConnectedDeviceCard from './bluetooth/ConnectedDeviceCard';
import DevicesList from './bluetooth/DevicesList';
import ScanningStatus from './bluetooth/ScanningStatus';

const BluetoothManager: React.FC = () => {
  const { 
    isScanning, 
    devices, 
    connectedDevice, 
    startScan, 
    connectToDevice, 
    disconnectDevice 
  } = useBluetooth();

  return (
    <div className="space-y-4">
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
