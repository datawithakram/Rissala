import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.divinecompass.app', // غير هذا بمعرف فريد لتطبيقك
  appName: 'الرسالة',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // تأكد من إزالة أي url محدد
    url: undefined
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#215B4C",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;