import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.petmanagement.app',
  appName: 'Pet Management System',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
