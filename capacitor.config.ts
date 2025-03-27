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
        noDeviceFound: "Nenhum dispositivo ELM327 encontrado"
      },
      scanMode: 2,
      scanTimeout: 10000,
      allowDuplicates: false,
      filters: [
        {
          name: "ELM327",
          namePrefix: "OBDII"
        }
      ]
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
