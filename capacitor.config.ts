import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tj.hamroh.app',
  appName: 'Hamroh',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
