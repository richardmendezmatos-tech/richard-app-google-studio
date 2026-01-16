import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initializePushNotifications = async () => {
    // Only run on native devices
    if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications not supported on web');
        return;
    }

    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        console.error('User denied permissions!');
        return;
    }

    await PushNotifications.register();

    // On success, we get a specific token
    PushNotifications.addListener('registration', (token) => {
        console.log('Push Registration Token: ', token.value);
        // TODO: Send this token to your specific user profile in Firestore
        // updateDoc(doc(db, 'users', userId), { fcmToken: token.value });
    });

    // Some issue with our registration
    PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
        alert(`Mensaje de Richard Auto: ${notification.title}\n${notification.body}`);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
        // navigate('/garage'); // Example navigation
    });
};
