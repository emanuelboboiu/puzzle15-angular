import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ro.pontes.puzzlex',
  appName: 'Puzzle 15',
  webDir: 'dist/puzzle15/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
