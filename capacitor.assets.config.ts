import { CapacitorAssets } from '@capacitor/assets';

const config: CapacitorAssets.Config = {
  icon: {
    source: 'src/assets/icon.png',
    foreground: 'src/assets/icon.png',
    background: '#FFFFFF',
    padding: 0.1,
    adaptiveIcon: {
      foreground: 'src/assets/icon.png',
      background: '#FFFFFF',
      padding: 0.1,
    },
  },
  splash: {
    source: 'src/assets/splash.png',
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  android: {
    icon: {
      source: 'src/assets/icon.png',
      foreground: 'src/assets/icon.png',
      background: '#FFFFFF',
      padding: 0.1,
      adaptiveIcon: {
        foreground: 'src/assets/icon.png',
        background: '#FFFFFF',
        padding: 0.1,
      },
    },
    splash: {
      source: 'src/assets/splash.png',
      backgroundColor: '#FFFFFF',
      resizeMode: 'contain',
    },
  },
};

export default config; 