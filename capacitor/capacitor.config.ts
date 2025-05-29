/// <reference types="@capacitor/status-bar" />
/// <reference types="@capacitor/keyboard" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lobstahbots.lobstrack',
  appName: 'lobstrack',
  webDir: 'build',
  plugins: {
    StatusBar: {
      style: 'LIGHT',
    },
    Keyboard: {
      resizeOnFullScreen: true,
    }
  }
};

export default config;
