
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4f3a426f003c482d84c59d4f1f612bef',
  appName: 'turbo-gauge-logger',
  webDir: 'dist',
  server: {
    url: "https://4f3a426f-003c-482d-84c5-9d4f1f612bef.lovableproject.com?forceHideBadge=true",
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
