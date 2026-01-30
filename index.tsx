
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from './App';
import './index.css'; // Premium UI Styles

import { Provider } from 'react-redux';
import { store } from './store';
import { DealerProvider } from './contexts/DealerContext';

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

// Global Error Handler for "Loading" Stuck State
const showError = (msg: string) => {
  // IGNORE specific Firebase background errors that don't break the app
  if (msg.includes('installations/request-failed') || msg.includes('403') || msg.includes('FirebaseError')) {
    console.warn("[Startup] Suppressed non-critical background error:", msg);
    return;
  }

  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:black;color:red;z-index:999999;padding:20px;font-size:20px;';
  errDiv.innerText = 'CRITICAL STARTUP ERROR:\n' + msg;
  document.body.appendChild(errDiv);
};

window.onerror = (msg, url, line, col, error) => {
  showError(`${msg}\n${error?.stack || ''}`);
};

window.addEventListener('unhandledrejection', (e) => {
  showError(`Unhandled Promise: ${e.reason}`);
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
} catch (e: any) {
  showError(e.message + '\n' + e.stack);
}
