import { useEffect } from 'react';
import { useAuthStore } from '@/entities/session';

export const useAuthListener = () => {
  const { setUser, setRole, setLoading, logout } = useAuthStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    (async () => {
      const [{ auth }, { getUserRole }] = await Promise.all([
        import('@/shared/api/firebase/firebaseService'),
        import('@/features/auth/services/authService'),
      ]);

      if (!mounted) return;

      unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!mounted) return;

        if (user) {
          const role = await getUserRole(user.uid);
          if (!mounted) return;
          
          setRole(role);
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
          });
        } else {
          logout();
        }
        setLoading(false);
      });
    })().catch((error) => {
      console.error('Auth listener bootstrap failed:', error);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [setUser, setRole, setLoading, logout]);
};
