import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.richardautomotive.app',
  appName: 'Richard Auto',
  webDir: 'out',
  server: {
    // Para producción en dispositivos nativos, apunta al servidor en la nube de Vercel.
    // Esto preserva el funcionamiento de Next.js SSR, Middleware y Rutas de API.
    // En desarrollo local, puedes cambiar esto a 'http://10.0.2.2:3000' (Android Emulator) o 'http://localhost:3000' (iOS Simulator).
    url: 'https://www.richard-automotive.com',
    cleartext: true,
  },
};

export default config;
