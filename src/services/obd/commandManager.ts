
import { BleClient, textToDataView } from '@capacitor-community/bluetooth-le';
import connectionManager from './connectionManager';
import { BLE_UUIDS } from './constants';

/**
 * Handles sending commands to the OBD device
 */
export class CommandManager {
  /**
   * Sends a command to the OBD device
   */
  async sendCommand(command: string): Promise<void> {
    const deviceId = connectionManager.getDeviceId();
    if (!deviceId || !connectionManager.isConnected()) {
      throw new Error('Not connected to OBD device');
    }
    
    try {
      const data = textToDataView(command + '\r');
      await BleClient.write(
        deviceId,
        BLE_UUIDS.OBD_SERVICE_UUID,
        BLE_UUIDS.OBD_WRITE_UUID,
        data
      );
    } catch (error) {
      console.error(`Failed to send command: ${command}`, error);
      throw error;
    }
  }

  /**
   * Initializes the OBD connection with necessary setup commands
   */
  async initializeOBD(): Promise<void> {
    if (!connectionManager.getDeviceId() || !connectionManager.isConnected()) {
      throw new Error('Not connected to OBD device');
    }
    
    try {
      // Reset the device
      await this.sendCommand('ATZ');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Turn echo off
      await this.sendCommand('ATE0');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Set protocol to auto
      await this.sendCommand('ATSP0');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get protocol number
      await this.sendCommand('ATDPN');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Set headers off
      await this.sendCommand('ATH0');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Set spaces off
      await this.sendCommand('ATS0');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Set linefeeds off
      await this.sendCommand('ATL0');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('OBD-II connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OBD-II connection:', error);
      throw error;
    }
  }
}

export default new CommandManager();
