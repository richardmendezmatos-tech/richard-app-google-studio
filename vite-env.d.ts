/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register/react' {
    import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

    export interface UseRegisterSWOptions {
        immediate?: boolean
        onNeedRefresh?: () => void
        onOfflineReady?: () => void
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
        onRegisterError?: (error: any) => void
    }

    export function useRegisterSW(options?: UseRegisterSWOptions): {
        needRefresh: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
        offlineReady: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>
    }
}


