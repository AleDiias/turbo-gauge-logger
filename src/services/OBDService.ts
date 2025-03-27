
import connectionManager from './obd/connectionManager';
import commandManager from './obd/commandManager';
import dataManager from './obd/dataManager';

/**
 * Main OBD service facade that provides a single interface for all OBD operations
 */
class OBDService {
  async connect(deviceId: string): Promise<boolean> {
    const connected = await connectionManager.connect(deviceId);
    if (connected) {
      await commandManager.initializeOBD();
    }
    return connected;
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect();
  }

  // Engine data methods
  async getEngineRPM(): Promise<number | null> {
    return await dataManager.getEngineRPM();
  }

  async getVehicleSpeed(): Promise<number | null> {
    return await dataManager.getVehicleSpeed();
  }

  async getCoolantTemp(): Promise<number | null> {
    return await dataManager.getCoolantTemp();
  }

  async getBoostPressure(): Promise<number | null> {
    return await dataManager.getBoostPressure();
  }

  async getEngineLoad(): Promise<number | null> {
    return await dataManager.getEngineLoad();
  }

  async getIntakeTemp(): Promise<number | null> {
    return await dataManager.getIntakeTemp();
  }

  // Vehicle data methods
  async getBatteryVoltage(): Promise<number | null> {
    return await dataManager.getBatteryVoltage();
  }

  async getFuelConsumption(): Promise<number | null> {
    return await dataManager.getFuelConsumption();
  }

  // Diagnostic methods
  async getDTCCount(): Promise<number | null> {
    return await dataManager.getDTCCount();
  }
}

export default new OBDService();
