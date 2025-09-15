import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vitago.app',
  appName: 'VitaGo',
  webDir: 'dist',
  server: {
    androidScheme: "https",
    cleartext: true
  }
};

export default config;
