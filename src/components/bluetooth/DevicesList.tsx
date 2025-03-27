
import React from 'react';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { Button } from "@/components/ui/button";

interface DevicesListProps {
  devices: ScanResult[];
  onConnect: (device: ScanResult) => Promise<void>;
}

const DevicesList: React.FC<DevicesListProps> = ({ devices, onConnect }) => {
  if (devices.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-2 bg-slate-700">
        <h3 className="font-medium text-white">Dispositivos Disponíveis</h3>
      </div>
      <ul className="divide-y divide-slate-700">
        {devices.map((device) => (
          <li key={device.device.deviceId} className="p-3 hover:bg-slate-700/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-white">{device.device.name || "Dispositivo Desconhecido"}</p>
                <p className="text-xs text-slate-300">{device.device.deviceId}</p>
              </div>
              <Button size="sm" onClick={() => onConnect(device)}>
                Conectar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DevicesList;
