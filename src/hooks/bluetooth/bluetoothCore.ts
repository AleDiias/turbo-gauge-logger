
import { BleClient } from "@capacitor-community/bluetooth-le";
import { toast } from "@/components/ui/use-toast";
import { Capacitor } from '@capacitor/core';

// Initialize Bluetooth
export const initializeBluetooth = async (): Promise<boolean> => {
  try {
    await BleClient.initialize();
    toast({
      title: "Bluetooth Inicializado",
      description: "Bluetooth está pronto para uso",
    });
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Bluetooth:', error);
    toast({
      title: "Erro de Bluetooth",
      description: "Falha ao inicializar Bluetooth",
      variant: "destructive",
    });
    return false;
  }
};

// Check if we're in a browser environment
export const checkBluetoothEnvironment = async (): Promise<boolean> => {
  try {
    // Check if running in native platform (not a browser)
    if (Capacitor.isNativePlatform()) {
      console.log('Running on native platform, using real Bluetooth');
      return false; // Not a simulation environment
    }
    
    // Additional web browser check
    if (typeof navigator !== 'undefined' && 
        navigator.bluetooth && 
        navigator.bluetooth.getAvailability && 
        await navigator.bluetooth.getAvailability()) {
      console.log('Running in browser with Web Bluetooth support');
      return false; // Web Bluetooth is available
    }
    
    console.log('Running in browser without Bluetooth support, using simulation');
    return true; // Use simulation mode
  } catch (error) {
    console.log('Error checking Bluetooth environment, defaulting to simulation mode:', error);
    return true; // Default to simulation mode on error
  }
};

// Clean up Bluetooth connections
export const cleanupBluetoothConnection = async (deviceId: string | null): Promise<void> => {
  if (!deviceId) return;
  
  try {
    // Não desconectar automaticamente ao limpar, apenas liberar recursos
    console.log('Limpando recursos Bluetooth, mas mantendo a conexão');
  } catch (error) {
    console.error('Erro ao limpar recursos Bluetooth:', error);
  }
};
