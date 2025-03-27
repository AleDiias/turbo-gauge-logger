import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.asgard.turbo',
  appName: 'Asgard Turbo',
  webDir: 'dist',
  server: {
    url: "https://turbo.asgardai.com.br",
    cleartext: true,
    androidScheme: 'https',
    hostname: 'turbo.asgardai.com.br'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Procurando dispositivos ELM327...",
        cancel: "Cancelar",
        availableDevices: "Dispositivos Disponíveis",
        noDeviceFound: "Nenhum dispositivo ELM327 encontrado",
        connecting: "Conectando ao dispositivo...",
        connected: "Dispositivo conectado",
        disconnected: "Dispositivo desconectado",
        error: "Erro na conexão"
      },
      scanMode: 1,
      scanTimeout: 3000,
      allowDuplicates: false,
      autoConnect: false,
      autoDisconnect: true,
      stopScanAfterConnect: true,
      connectTimeout: 10000,
      filters: [
        {
          services: ["FFE0"],
          name: "ELM327",
          namePrefix: "OBDII"
        }
      ],
      android: {
        scanMode: 1,
        scanTimeout: 3000,
        autoConnect: false,
        autoDisconnect: true,
        stopScanOnConnect: true,
        showNotification: false,
        powerLevel: "high"
      }
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    initialFocus: true,
    backgroundColor: '#FFFFFF'
  }
};

export default config;
