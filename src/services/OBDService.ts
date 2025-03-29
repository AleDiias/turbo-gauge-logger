
import connectionManager from './obd/connectionManager';
import commandManager from './obd/commandManager';
import dataManager from './obd/dataManager';

/**
 * Main OBD service facade that provides a single interface for all OBD operations
 */
class OBDService {
  async connect(deviceId: string): Promise<boolean> {
    try {
      console.log('OBDService: Iniciando conexão com dispositivo', deviceId);
      const connected = await connectionManager.connect(deviceId);
      
      if (connected) {
        console.log('OBDService: Dispositivo conectado, inicializando OBD...');
        await commandManager.initializeOBD();
        console.log('OBDService: OBD inicializado com sucesso');
        return true;
      } else {
        console.log('OBDService: Falha na conexão com o dispositivo');
        return false;
      }
    } catch (error) {
      console.error('OBDService: Erro durante processo de conexão:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      console.log('OBDService: Desconectando');
      await connectionManager.disconnect();
      console.log('OBDService: Desconectado com sucesso');
    } catch (error) {
      console.error('OBDService: Erro ao desconectar:', error);
      throw error;
    }
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
  
  async getDiagnosticTroubleCodes(): Promise<string[]> {
    return await dataManager.getDiagnosticTroubleCodes();
  }
  
  async clearDiagnosticTroubleCodes(): Promise<boolean> {
    return await dataManager.clearDiagnosticTroubleCodes();
  }
}

export default new OBDService();
