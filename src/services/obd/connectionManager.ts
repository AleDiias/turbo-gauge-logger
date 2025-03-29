
import { BleClient, dataViewToText } from '@capacitor-community/bluetooth-le';
import { BLE_UUIDS } from './constants';

/**
 * Handles Bluetooth connection to OBD device
 */
export class ConnectionManager {
  private deviceId: string | null = null;
  private connected: boolean = false;
  private notificationsActive: boolean = false;

  async connect(deviceId: string): Promise<boolean> {
    try {
      // Check if already connected to the same device
      if (this.deviceId === deviceId && this.connected) {
        console.log('Already connected to this device');
        return true;
      }
      
      // Ensure any previous connection is properly closed
      if (this.deviceId && this.deviceId !== deviceId) {
        await this.disconnect();
      }
      
      console.log(`Connecting to OBD device: ${deviceId}`);
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
      this.notificationsActive = true;
      console.log(`Successfully connected to OBD device: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('Failed to connect to OBD device:', error);
      this.connected = false;
      this.notificationsActive = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.deviceId) {
      console.log('No device to disconnect from');
      return;
    }
    
    try {
      console.log(`Disconnecting from device: ${this.deviceId}`);
      
      // Stop notifications if they're active
      if (this.notificationsActive) {
        try {
          await BleClient.stopNotifications(
            this.deviceId,
            BLE_UUIDS.OBD_SERVICE_UUID,
            BLE_UUIDS.OBD_NOTIFY_UUID
          );
          this.notificationsActive = false;
          console.log('Stopped notifications');
        } catch (notifyError) {
          console.error('Error stopping notifications:', notifyError);
        }
      }
      
      // Disconnect from device
      await BleClient.disconnect(this.deviceId);
      console.log('Disconnected from device');
      this.connected = false;
      this.deviceId = null;
    } catch (error) {
      console.error('Error during OBD device disconnect:', error);
      // Force reset the state even if the disconnect failed
      this.connected = false;
      this.deviceId = null;
      this.notificationsActive = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
  
  getDeviceId(): string | null {
    return this.deviceId;
  }

  setConnectionState(state: boolean): void {
    this.connected = state;
  }
}

export default new ConnectionManager();
