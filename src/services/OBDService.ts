
import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

// Standard OBD-II PIDs
const PIDs = {
  ENGINE_RPM: '010C',               // RPM
  VEHICLE_SPEED: '010D',            // Vehicle speed
  COOLANT_TEMP: '0105',             // Engine coolant temperature
  INTAKE_TEMP: '010F',              // Intake air temperature
  MAF_RATE: '0110',                 // Mass air flow rate
  THROTTLE_POS: '0111',             // Throttle position
  ENGINE_LOAD: '0104',              // Engine load
  BOOST_PRESSURE: '010B',           // Intake manifold pressure (can indicate boost)
  BATTERY_VOLTAGE: '0142',          // Control module voltage
  FUEL_RATE: '015E',                // Fuel rate
  FUEL_LEVEL: '012F',               // Fuel level input
  DTC_COUNT: '0101',                // Diagnostic Trouble Codes count
};

// Service and characteristic UUIDs for ELM327 over BLE
// Note: These may need to be adjusted for specific ELM327 BLE adapters
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_WRITE_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
const OBD_NOTIFY_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';

class OBDService {
  private deviceId: string | null = null;
  private connected: boolean = false;

  async connect(deviceId: string): Promise<boolean> {
    try {
      await BleClient.connect(deviceId);
      
      // Subscribe to notifications
      await BleClient.startNotifications(
        deviceId,
        OBD_SERVICE_UUID,
        OBD_NOTIFY_UUID,
        (value) => {
          const response = dataViewToText(value);
          console.log('Received OBD response:', response);
          // Process the response here
        }
      );
      
      this.deviceId = deviceId;
      this.connected = true;
      
      // Initialize the connection with ELM327
      await this.initializeOBD();
      
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
        OBD_SERVICE_UUID,
        OBD_NOTIFY_UUID
      );
      await BleClient.disconnect(this.deviceId);
      this.connected = false;
      this.deviceId = null;
    } catch (error) {
      console.error('Error disconnecting from OBD device:', error);
    }
  }

  private async sendCommand(command: string): Promise<void> {
    if (!this.deviceId || !this.connected) {
      throw new Error('Not connected to OBD device');
    }
    
    try {
      const data = textToDataView(command + '\r');
      await BleClient.write(
        this.deviceId,
        OBD_SERVICE_UUID,
        OBD_WRITE_UUID,
        data
      );
    } catch (error) {
      console.error(`Failed to send command: ${command}`, error);
      throw error;
    }
  }

  private async initializeOBD(): Promise<void> {
    if (!this.deviceId || !this.connected) {
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

  async getEngineRPM(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.ENGINE_RPM);
      // In a real implementation, we would parse the response
      // This is a placeholder for now
      return Math.floor(Math.random() * 6000); // Mock data
    } catch (error) {
      console.error('Error getting engine RPM:', error);
      return null;
    }
  }

  async getVehicleSpeed(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.VEHICLE_SPEED);
      // Mock data
      return Math.floor(Math.random() * 160);
    } catch (error) {
      console.error('Error getting vehicle speed:', error);
      return null;
    }
  }

  async getCoolantTemp(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.COOLANT_TEMP);
      // Mock data
      return 80 + Math.floor(Math.random() * 20);
    } catch (error) {
      console.error('Error getting coolant temperature:', error);
      return null;
    }
  }

  async getBoostPressure(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.BOOST_PRESSURE);
      // Mock data (in psi)
      return (Math.random() * 15).toFixed(1) as unknown as number;
    } catch (error) {
      console.error('Error getting boost pressure:', error);
      return null;
    }
  }

  async getEngineLoad(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.ENGINE_LOAD);
      // Mock data (percentage)
      return Math.floor(Math.random() * 100);
    } catch (error) {
      console.error('Error getting engine load:', error);
      return null;
    }
  }

  async getIntakeTemp(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.INTAKE_TEMP);
      // Mock data (celsius)
      return 20 + Math.floor(Math.random() * 40);
    } catch (error) {
      console.error('Error getting intake temperature:', error);
      return null;
    }
  }

  async getBatteryVoltage(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.BATTERY_VOLTAGE);
      // Mock data (volts)
      return 12 + (Math.random() * 2).toFixed(1) as unknown as number;
    } catch (error) {
      console.error('Error getting battery voltage:', error);
      return null;
    }
  }

  async getFuelConsumption(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.FUEL_RATE);
      // Mock data (L/100km)
      return (5 + Math.random() * 10).toFixed(1) as unknown as number;
    } catch (error) {
      console.error('Error getting fuel consumption:', error);
      return null;
    }
  }

  async getDTCCount(): Promise<number | null> {
    try {
      await this.sendCommand(PIDs.DTC_COUNT);
      // Mock data
      return Math.floor(Math.random() * 3);
    } catch (error) {
      console.error('Error getting DTC count:', error);
      return null;
    }
  }
}

export default new OBDService();
