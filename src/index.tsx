// CRITICAL: Suppress Firebase Installations 403 errors BEFORE any Firebase initialization
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const msg = args.join(' ');
    if (msg.includes('firebaseinstallations.googleapis.com') ||
      msg.includes('installations/request-failed') ||
      msg.includes('PERMISSION_DENIED') ||
      msg.includes('FirebaseError: Installations')) {
      console.warn('[Firebase] Installations API error suppressed (API key restriction)');
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', function (event) {
    const msg = (event.reason?.message || event.reason?.toString() || '');
    if (msg.includes('firebaseinstallations.googleapis.com') ||
      msg.includes('installations/request-failed') ||
      msg.includes('PERMISSION_DENIED')) {
      console.warn('[Firebase] Installations promise rejection suppressed');
      event.preventDefault();
    }
  });
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from '@/App';
import './index.css'; // Premium UI Styles

import { Provider } from 'react-redux';
import { store } from '@/store';
import { DealerProvider } from '@/contexts/DealerContext';
import './i18n'; // i18n setup
import { nativeBridgeService } from '@/services/nativeBridgeService';


// Initialize Native Bridge (Capacitor)
console.log('App Version: HookFix - ' + new Date().toISOString());
nativeBridgeService.initialize();

// Initialize Capacitor PWA Elements (Camera, etc.)
defineCustomElements(window);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Performance: Don't refetch on tab switch by default
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    beforeSend(event, hint) {
      const message = String(
        hint.originalException instanceof Error
          ? hint.originalException.message
          : (event.message || '')
      ).toLowerCase();

      if (
        message.includes('firebaseinstallations.googleapis.com') ||
        message.includes('installations/request-failed') ||
        message.includes('permission_denied') ||
        message.includes('firebaseerror: installations')
      ) {
        return null;
      }

      return event;
    },
  });
}

// Global Error Handler for "Loading" Stuck State
// Global Error Handler for "Loading" Stuck State
const showError = (msg: string) => {
  const lowerMsg = msg.toLowerCase();

  // CORE UI SILENCE: Never show red screen for these keywords
  // Added permission_denied and firebaseinstallations for more robust matching
  const suppressed = [
    'firebase', 'installations', '403', 'denied', 'analytics',
    'perf', 'messaging', 'storage', 'auth', 'app-check', 'appcheck',
    'permission_denied', 'firebaseinstallations', 'firestore'
  ];

  if (suppressed.some(k => lowerMsg.includes(k))) {
    console.warn("⚠️ [Bootstrap] Noise suppressed:", msg);
    return;
  }

  // Prevent duplicate overlays
  if (document.getElementById('startup-error-overlay')) return;

  const errDiv = document.createElement('div');
  errDiv.id = 'startup-error-overlay';
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0b1120;color:#94a3b8;z-index:999999;padding:40px;font-size:16px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;';

  errDiv.innerHTML = `
    <div style="max-width:600px;width:100%;background:#1e293b;padding:40px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="font-size:40px;margin-bottom:20px;">🛡️</div>
      <h1 style="color:white;font-size:24px;margin-bottom:12px;font-weight:900;letter-spacing:-0.025em;">Richard Automotive OS</h1>
      <p style="color:#94a3b8;margin-bottom:24px;line-height:1.6;">Se detectó una anomalía en el arranque del sistema. Esto suele ocurrir por restricciones de red o caché antigua.</p>
      
      <div style="background:#0f172a;padding:15px;border-radius:12px;border:1px solid #334155;color:#f87171;font-size:12px;white-space:pre-wrap;margin-bottom:30px;max-height:150px;overflow:auto;">
        ${msg}
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;">
        <button onclick="window.location.reload(true)" style="width:100%;padding:14px;background:#3b82f6;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:14px;transition:all 0.2s;">
          REINTENTAR CARGA (Re-sync)
        </button>
        <button onclick="document.getElementById('startup-error-overlay').remove()" style="width:100%;padding:14px;background:transparent;color:#64748b;border:1px solid #334155;border-radius:10px;cursor:pointer;font-weight:600;font-size:13px;">
          IGNORAR Y CONTINUAR
        </button>
      </div>
      
      <div style="margin-top:25px;font-size:10px;color:#475569;text-align:center;letter-spacing:0.1em;">
        VERSION: 1.0.3-BLINDADO | RELIABILITY LAYER
      </div>
    </div>
  `;
  document.body.appendChild(errDiv);
};

window.onerror = (msg, url, line, col, error) => {
  const message = error instanceof Error ? error.message : String(msg);
  showError(`${message}\n${error?.stack || ''}`);
};

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason;
  // Robust serialization for Firebase Error objects which might not stringify well
  let message = "";
  if (reason instanceof Error) {
    message = reason.message;
  } else if (typeof reason === 'object' && reason !== null) {
    try {
      message = JSON.stringify(reason);
    } catch {
      message = String(reason);
    }
  } else {
    message = String(reason);
  }

  showError(`Unhandled Promise: ${message}`);
});

console.log("🚀 [Index] Booting React Application...");
try {
  const root = ReactDOM.createRoot(rootElement);
  console.log("✅ [Index] Root created, rendering...");
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <DealerProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </DealerProvider>
      </Provider>
    </React.StrictMode>
  );
} catch (e: unknown) {
  const err = e instanceof Error ? e : new Error(String(e));
  showError(err.message + '\n' + err.stack);
}
