
import { BleClient, dataViewToText } from '@capacitor-community/bluetooth-le';
import { BLE_UUIDS } from './constants';

/**
 * Handles Bluetooth connection to OBD device
 */
export class ConnectionManager {
  private deviceId: string | null = null;
  private connected: boolean = false;

  async connect(deviceId: string): Promise<boolean> {
    try {
      await BleClient.connect(deviceId);
      
      // Subscribe to notifications
      await BleClient.startNotifications(
        deviceId,
        BLE_UUIDS.OBD_SERVICE_UUID,
        BLE_UUIDS.OBD_NOTIFY_UUID,
        (value) => {
          const response = dataViewToText(value);
          console.log('Received OBD response:', response);
          // Process the response here
        }
      );
      
      this.deviceId = deviceId;
      this.connected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to OBD device:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.deviceId || !this.connected) return;
    
    try {
      await BleClient.stopNotifications(
        this.deviceId,
        BLE_UUIDS.OBD_SERVICE_UUID,
        BLE_UUIDS.OBD_NOTIFY_UUID
      );
      await BleClient.disconnect(this.deviceId);
      this.connected = false;
      this.deviceId = null;
    } catch (error) {
      console.error('Error disconnecting from OBD device:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
  
  getDeviceId(): string | null {
    return this.deviceId;
  }
}

export default new ConnectionManager();
