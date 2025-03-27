
import { OBD_PIDS } from './constants';
import commandManager from './commandManager';

/**
 * Handles retrieving specific sensor data from the OBD device
 */
export class DataManager {
  async getEngineRPM(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.ENGINE_RPM);
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
      await commandManager.sendCommand(OBD_PIDS.VEHICLE_SPEED);
      // Mock data
      return Math.floor(Math.random() * 160);
    } catch (error) {
      console.error('Error getting vehicle speed:', error);
      return null;
    }
  }

  async getCoolantTemp(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.COOLANT_TEMP);
      // Mock data
      return 80 + Math.floor(Math.random() * 20);
    } catch (error) {
      console.error('Error getting coolant temperature:', error);
      return null;
    }
  }

  async getBoostPressure(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.BOOST_PRESSURE);
      // Mock data (in psi)
      return (Math.random() * 15).toFixed(1) as unknown as number;
    } catch (error) {
      console.error('Error getting boost pressure:', error);
      return null;
    }
  }

  async getEngineLoad(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.ENGINE_LOAD);
      // Mock data (percentage)
      return Math.floor(Math.random() * 100);
    } catch (error) {
      console.error('Error getting engine load:', error);
      return null;
    }
  }

  async getIntakeTemp(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.INTAKE_TEMP);
      // Mock data (celsius)
      return 20 + Math.floor(Math.random() * 40);
    } catch (error) {
      console.error('Error getting intake temperature:', error);
      return null;
    }
  }

  async getBatteryVoltage(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.BATTERY_VOLTAGE);
      // Mock data (volts)
      return 12 + (Math.random() * 2).toFixed(1) as unknown as number;
    } catch (error) {
      console.error('Error getting battery voltage:', error);
      return null;
    }
  }

  async getFuelConsumption(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.FUEL_RATE);
      // Mock data (L/100km)
      return (5 + Math.random() * 10).toFixed(1) as unknown as number;
    } catch (error) {
      console.error('Error getting fuel consumption:', error);
      return null;
    }
  }

  async getDTCCount(): Promise<number | null> {
    try {
      await commandManager.sendCommand(OBD_PIDS.DTC_COUNT);
      // Mock data
      return Math.floor(Math.random() * 3);
    } catch (error) {
      console.error('Error getting DTC count:', error);
      return null;
    }
  }
}

export default new DataManager();
