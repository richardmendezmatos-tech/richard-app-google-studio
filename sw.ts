import { defaultCache } from '@serwist/next/worker';
import type { SerwistGlobalConfig } from '@serwist/sw';
import { installSerwist } from '@serwist/sw';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | URL)[];
  }
}

declare const self: WorkerGlobalScope;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
