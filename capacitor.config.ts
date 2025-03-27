import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.turbo.gauge.logger',
  appName: 'Turbo Gauge Logger',
  webDir: 'dist',
  server: {
    url: 'https://turbo.asgardai.com.br',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: ['turbo.asgardai.com.br', '34.70.177.193'],
    allowMixedContent: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    BluetoothLe: {
      displayName: 'Turbo Gauge Logger',
      displayNameShort: 'Turbo Logger'
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keyPassword: undefined,
    },
    icon: {
      source: 'src/assets/icon-512.png',
      foreground: 'src/assets/icon-512.png',
      background: '#FFFFFF',
      padding: 0.1,
      adaptiveIcon: {
        foreground: 'src/assets/icon-512.png',
        background: '#FFFFFF',
        padding: 0.1,
      },
    },
  }
};

export default config;
