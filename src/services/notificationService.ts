import { getMessagingService } from '@/infra/firebase/optionalServices';
import { getToken, onMessage } from 'firebase/messaging';
import { isBrowser } from '@/infra/firebase/client';

export const requestNotificationPermission = async () => {
  if (!isBrowser) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = await getMessagingService();
      if (!messaging) return null;

      // We need a VAPID key. Richard, if you have one, we should put it in .env.
      // For now, I'll use a placeholder that might work if configured in Firebase Console.
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      console.log('FCM Token:', token);
      // In a real implementation, we would save this token to the user/dealer record in Firestore.
      return token;
    }
  } catch (error) {
    console.error('Notification Permission Error:', error);
  }
  return null;
};

export const onForegroundMessage = async (callback: (payload: any) => void) => {
  const messaging = await getMessagingService();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};
