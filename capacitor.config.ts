import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.itlc.hrms',
  appName: 'OmniStaff',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
