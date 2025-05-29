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

if (process.env.CAPACITOR_DEV_SERVER) {
  config.server = {
    url: process.env.CAPACITOR_DEV_SERVER,
    cleartext: true,
  };
}

export default config;
