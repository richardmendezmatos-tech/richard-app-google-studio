import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * MobileNotificationService: Gestión de notificaciones push nativas.
 * Permite a Sales Copilot alertar proactivamente sobre leads calificados.
 */
export class MobileNotificationService {

    static async requestPermissions(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return false;

        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.warn('Push notification permissions denied');
            return false;
        }

        await PushNotifications.register();
        return true;
    }

    static setupListeners(onNotificationReceived: (notification: any) => void) {
        if (!Capacitor.isNativePlatform()) return;

        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token: ' + token.value);
            // CTO: Aquí enviaríamos el token a Firestore para este usuario
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received: ' + JSON.stringify(notification));
            onNotificationReceived(notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push action performed: ' + JSON.stringify(notification));
            // CTO: Aquí manejaríamos la navegación al lead específico
        });
    }
}
