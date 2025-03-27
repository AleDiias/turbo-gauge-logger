import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asgardturbo.app',
  appName: 'Asgard Turbo',
  webDir: 'dist',
  server: {
    url: "https://turbo.asgardai.com.br",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Scanning for ELM327 devices...",
        cancel: "Cancel",
        availableDevices: "Available Devices",
        noDeviceFound: "No ELM327 devices found"
      }
    }
  }
};

export default config;
