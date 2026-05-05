
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // FCM is being decommissioned. Future integration: OneSignal or custom service worker.
      console.log('Notification permission granted.');
      return 'placeholder-token';
    }
  } catch (error) {
    console.error('Notification Permission Error:', error);
  }
  return null;
};

export const onForegroundMessage = async (callback: (payload: any) => void) => {
  // FCM is being decommissioned.
  console.log('Foreground messaging disabled (Firebase purge).');
};

