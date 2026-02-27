// CRITICAL: Suppress Firebase Installations 403 errors BEFORE any Firebase initialization
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const msg = args.join(' ');
    if (
      msg.includes('firebaseinstallations.googleapis.com') ||
      msg.includes('installations/request-failed') ||
      msg.includes('PERMISSION_DENIED') ||
      msg.includes('FirebaseError: Installations')
    ) {
      console.warn('[Firebase] Installations API error suppressed (API key restriction)');
      return;
    }
    originalError.apply(console, args);
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import './index.css'; // Premium UI Styles

import { Provider } from 'react-redux';
import { store } from '@/store';
import { DealerProvider } from '@/contexts/DealerContext';
import './i18n'; // i18n setup
import { nativeBridgeService } from '@/services/nativeBridgeService';

declare global {
  interface Window {
    __richardHardRecover?: () => Promise<void>;
    __appBootReady?: boolean;
  }
}

// Initialize Native Bridge (Capacitor)
console.log('App Version: HookFix - ' + new Date().toISOString());
nativeBridgeService.initialize();

const initializePwaElements = async () => {
  try {
    const pwaElements = await import('@ionic/pwa-elements/loader');
    pwaElements.defineCustomElements(window);
  } catch (error) {
    console.warn('[Bootstrap] PWA elements init skipped:', error);
  }
};

void initializePwaElements();

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
  throw new Error('Could not find root element to mount to');
}

const hardRecoverClient = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }

    sessionStorage.clear();
  } catch (recoveryError) {
    console.warn('[Recovery] Hard recover failed:', recoveryError);
  } finally {
    window.location.reload();
  }
};

window.__richardHardRecover = hardRecoverClient;
window.__appBootReady = false;

// Global Error Handler for "Loading" Stuck State
const showError = (msg: string) => {
  const lowerMsg = msg.toLowerCase();

  // CORE UI SILENCE: Only suppress the specific installations 403 noise
  const suppressedKeywords = [
    'firebaseinstallations',
    'installations/request-failed',
    'permission_denied',
  ];
  if (suppressedKeywords.some((k) => lowerMsg.includes(k))) {
    console.warn('⚠️ [Bootstrap] Noise suppressed:', msg);
    return;
  }

  // Prevent duplicate overlays
  if (document.getElementById('startup-error-overlay')) return;

  const errOverlay = document.createElement('div');
  errOverlay.id = 'startup-error-overlay';
  Object.assign(errOverlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: '#0b1120',
    color: '#94a3b8',
    zIndex: '999999',
    padding: '40px',
    fontSize: '16px',
    overflow: 'auto',
    fontFamily: 'ui-monospace, monospace',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    maxWidth: '600px',
    width: '100%',
    background: '#1e293b',
    padding: '40px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  });

  const icon = document.createElement('div');
  icon.style.fontSize = '40px';
  icon.style.marginBottom = '20px';
  icon.textContent = '🛡️';

  const title = document.createElement('h1');
  Object.assign(title.style, {
    color: 'white',
    fontSize: '24px',
    marginBottom: '12px',
    fontWeight: '900',
    letterSpacing: '-0.025em',
  });
  title.textContent = 'Richard Automotive OS';

  const desc = document.createElement('p');
  Object.assign(desc.style, {
    color: '#94a3b8',
    marginBottom: '24px',
    lineHeight: '1.6',
  });
  desc.textContent =
    'Se detectó una anomalía en el arranque del sistema. Esto suele ocurrir por restricciones de red o caché antigua.';

  const logBox = document.createElement('div');
  Object.assign(logBox.style, {
    background: '#0f172a',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #334155',
    color: '#f87171',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    marginBottom: '30px',
    maxHeight: '150px',
    overflow: 'auto',
  });
  logBox.textContent = msg; // SAFE: textContent avoids XSS

  const btnContainer = document.createElement('div');
  Object.assign(btnContainer.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  });

  const createBtn = (text: string, bg: string, onClick: () => void) => {
    const btn = document.createElement('button');
    Object.assign(btn.style, {
      width: '100%',
      padding: '14px',
      background: bg,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '14px',
    });
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
  };

  btnContainer.appendChild(
    createBtn('REINTENTAR CARGA (Re-sync)', '#3b82f6', () => window.location.reload()),
  );
  btnContainer.appendChild(
    createBtn('REPARAR CACHE Y SERVICE WORKER', '#0f766e', () => window.__richardHardRecover?.()),
  );
  btnContainer.appendChild(
    createBtn('IGNORAR Y CONTINUAR', 'transparent', () => errOverlay.remove()),
  );

  card.append(icon, title, desc, logBox, btnContainer);
  errOverlay.appendChild(card);
  document.body.appendChild(errOverlay);
};

window.onerror = (msg, url, line, col, error) => {
  const message = error instanceof Error ? error.message : String(msg);
  showError(`${message}\n${error?.stack || ''}`);
};

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason;
  const msg = reason?.message || reason?.toString() || '';

  // Consolidate suppression and error reporting
  if (msg.includes('firebaseinstallations') || msg.includes('PERMISSION_DENIED')) {
    console.warn('[Firebase] Promise rejection suppressed (API Restriction)');
    return;
  }

  let fullMessage = '';
  if (reason instanceof Error) {
    fullMessage = reason.message;
  } else if (typeof reason === 'object' && reason !== null) {
    try {
      fullMessage = JSON.stringify(reason);
    } catch {
      fullMessage = String(reason);
    }
  } else {
    fullMessage = String(reason);
  }

  showError(`Unhandled Promise: ${fullMessage}`);
});

setTimeout(() => {
  if (!window.__appBootReady && !document.getElementById('startup-error-overlay')) {
    showError(
      'Startup timeout: la aplicacion no termino de iniciar en 12s. Posible cache/SW inconsistente.',
    );
  }
}, 12_000);

const BootReadySignal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    window.__appBootReady = true;
  }, []);

  return <>{children}</>;
};

console.log('🚀 [Index] Booting React Application...');
try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ [Index] Root created, rendering...');
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <DealerProvider>
          <QueryClientProvider client={queryClient}>
            <BootReadySignal>
              <App />
            </BootReadySignal>
          </QueryClientProvider>
        </DealerProvider>
      </Provider>
    </React.StrictMode>,
  );
} catch (e: unknown) {
  const err = e instanceof Error ? e : new Error(String(e));
  showError(err.message + '\n' + err.stack);
}
