
import React from 'react';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { Button } from "@/components/ui/button";

interface ConnectedDeviceCardProps {
  device: ScanResult;
  onDisconnect: () => Promise<void>;
}

const ConnectedDeviceCard: React.FC<ConnectedDeviceCardProps> = ({ device, onDisconnect }) => {
  return (
    <div className="bg-green-900/20 p-4 rounded-lg border border-green-600">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-green-500">Connected to:</p>
          <p>{device.device.name || device.device.deviceId}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={onDisconnect}>
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default ConnectedDeviceCard;
