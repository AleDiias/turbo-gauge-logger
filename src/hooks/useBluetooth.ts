
import { useState, useEffect } from 'react';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { toast } from "@/components/ui/use-toast";

export const useBluetooth = () => {
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

  return {
    isScanning,
    devices,
    connectedDevice,
    startScan,
    connectToDevice,
    disconnectDevice
  };
};
