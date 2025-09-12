import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vitago.app',
  appName: 'VitaGo',
  webDir: 'dist',
  server: {
    url: 'https://vitago.netlify.app', // URL de tu Netlify
    cleartext: true
  }
};

export default config;

