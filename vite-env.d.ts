/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_ANTIGRAVITY_EDGE_URL?: string
    readonly VITE_ANTIGRAVITY_API_URL?: string
    readonly VITE_ANTIGRAVITY_API_KEY?: string
    readonly VITE_ANTIGRAVITY_HEALTH_PATH?: string
    readonly VITE_ANTIGRAVITY_IMAGE_PATH?: string
    readonly VITE_ANTIGRAVITY_LEAD_ACTION_PATH?: string
    readonly VITE_ANTIGRAVITY_OUTREACH_ACTION_PATH?: string
    readonly VITE_RESEND_API_KEY?: string
    readonly VITE_RESEND_FROM_EMAIL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

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
