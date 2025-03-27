import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.asgard.turbo',
  appName: 'Asgard Turbo',
  webDir: 'dist',
  server: {
    url: "https://turbo.asgardai.com.br/",
    cleartext: true,
    androidScheme: 'https'
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
        connecting: "Conectando...",
        connected: "Conectado",
        disconnected: "Desconectado",
        error: "Erro ao conectar"
      },
      scanMode: 2,
      scanTimeout: 5000,
      allowDuplicates: false,
      autoConnect: false,
      autoDisconnect: true,
      filters: [
        {
          name: "ELM327",
          namePrefix: "OBDII"
        }
      ],
      android: {
        scanMode: 2,
        scanTimeout: 5000,
        autoConnect: false,
        autoDisconnect: true
      }
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
