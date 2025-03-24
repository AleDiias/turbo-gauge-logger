
import React, { useState, useEffect } from 'react';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const BluetoothManager: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);

  useEffect(() => {
    const initializeBluetooth = async () => {
      try {
        await BleClient.initialize();
        toast({
          title: "Bluetooth Initialized",
          description: "Bluetooth is ready to use",
        });
      } catch (error) {
        console.error('Error initializing Bluetooth:', error);
        toast({
          title: "Bluetooth Error",
          description: "Failed to initialize Bluetooth",
          variant: "destructive",
        });
      }
    };

    initializeBluetooth();

    return () => {
      // Cleanup function
      const cleanup = async () => {
        try {
          if (connectedDevice) {
            await BleClient.disconnect(connectedDevice.device.deviceId);
          }
        } catch (error) {
          console.error('Error disconnecting:', error);
        }
      };
      
      cleanup();
    };
  }, [connectedDevice]);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setDevices([]);
      
      await BleClient.requestLEScan(
        {
          services: [], // Scan for all services
          namePrefix: 'ELM', // Look for devices with "ELM" in the name
          allowDuplicates: false,
        },
        (result) => {
          setDevices((prevDevices) => {
            // Check if device already exists in the list
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

      // Stop scanning after 10 seconds
      setTimeout(async () => {
        try {
          await BleClient.stopLEScan();
          setIsScanning(false);
          toast({
            title: "Scan Complete",
            description: `Found ${devices.length} devices`,
          });
        } catch (error) {
          console.error('Error stopping scan:', error);
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting scan:', error);
      setIsScanning(false);
      toast({
        title: "Scan Error",
        description: "Failed to start scanning for devices",
        variant: "destructive",
      });
    }
  };

  const connectToDevice = async (device: ScanResult) => {
    try {
      await BleClient.connect(device.device.deviceId);
      setConnectedDevice(device);
      toast({
        title: "Connected",
        description: `Connected to ${device.device.name || device.device.deviceId}`,
      });
    } catch (error) {
      console.error('Error connecting to device:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the device",
        variant: "destructive",
      });
    }
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    
    try {
      await BleClient.disconnect(connectedDevice.device.deviceId);
      setConnectedDevice(null);
      toast({
        title: "Disconnected",
        description: "Device disconnected successfully",
      });
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      toast({
        title: "Disconnection Error",
        description: "Failed to disconnect from the device",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bluetooth Connection</h2>
        {!isScanning ? (
          <Button onClick={startScan} disabled={isScanning}>
            Scan for Devices
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Scanning...
          </Button>
        )}
      </div>

      {connectedDevice && (
        <div className="bg-green-900/20 p-4 rounded-lg border border-green-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-green-500">Connected to:</p>
              <p>{connectedDevice.device.name || connectedDevice.device.deviceId}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={disconnectDevice}>
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {devices.length > 0 && !connectedDevice && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-2 bg-slate-700">
            <h3 className="font-medium">Available Devices</h3>
          </div>
          <ul className="divide-y divide-slate-700">
            {devices.map((device) => (
              <li key={device.device.deviceId} className="p-3 hover:bg-slate-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{device.device.name || "Unknown Device"}</p>
                    <p className="text-xs text-slate-400">{device.device.deviceId}</p>
                  </div>
                  <Button size="sm" onClick={() => connectToDevice(device)}>
                    Connect
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isScanning && devices.length === 0 && (
        <div className="text-center p-8">
          <p className="text-slate-400">Searching for ELM327 devices...</p>
        </div>
      )}

      {!isScanning && devices.length === 0 && (
        <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
          <p className="text-slate-400">No devices found. Try scanning again.</p>
        </div>
      )}
    </div>
  );
};

export default BluetoothManager;
