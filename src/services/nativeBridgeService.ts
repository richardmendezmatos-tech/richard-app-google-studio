import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';

/**
 * NativeBridgeService
 * Centralized service to manage Capacitor native features.
 */
class NativeBridgeService {
    private isNative = Capacitor.isNativePlatform();

    async initialize(): Promise<void> {
        if (!this.isNative) {
            console.log('[NativeBridge] Running on Web - Native features disabled.');
            return;
        }

        console.log('[NativeBridge] Initializing native listeners...');
        this.setupAppListeners();
        await this.requestPushPermissions();
    }

    private setupAppListeners(): void {
        CapApp.addListener('appStateChange', ({ isActive }) => {
            console.log('[NativeBridge] App state changed. Is active?', isActive);
        });

        CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
                CapApp.exitApp();
            } else {
                window.history.back();
            }
        });
    }

    async requestPushPermissions(): Promise<boolean> {
        if (!this.isNative) return false;

        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.warn('[NativeBridge] Push permissions not granted.');
            return false;
        }

        await PushNotifications.register();
        this.setupPushListeners();
        return true;
    }

    private setupPushListeners(): void {
        PushNotifications.addListener('registration', (token) => {
            console.log('[NativeBridge] Push registration success, token:', token.value);
            // Sync with Firestore for targeted alerts
            this.syncToken(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error('[NativeBridge] Push registration error:', error.error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[NativeBridge] Push received:', notification);
            // Default alert behavior if open
            if (this.isNative) {
                alert(`Mensaje de Richard Auto: ${notification.title}\n${notification.body}`);
            }
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('[NativeBridge] Push action performed:', notification.actionId);
            // TODO: Route to specific car or lead detail
        });
    }

    private async syncToken(token: string): Promise<void> {
        // Placeholder for future multi-user / dealer-specific token management
        localStorage.setItem('fcm_token', token);
    }

    /**
     * Send a local notification (fallback for non-cloud-backed alerts)
     */
    async sendLocalNotification(title: string, body: string): Promise<void> {
        if (!this.isNative) {
            // Fallback for web? Browsers support notifications too but keeping it simple.
            return;
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: Date.now(),
                    schedule: { at: new Date(Date.now() + 1000) },
                    sound: undefined,
                    attachments: undefined,
                    actionTypeId: '',
                    extra: null
                }
            ]
        });
    }
}

export const nativeBridgeService = new NativeBridgeService();
