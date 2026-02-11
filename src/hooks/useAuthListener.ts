import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '@/store/slices/authSlice';

export const useAuthListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let mounted = true;

        (async () => {
            const [{ auth }, { isAdminEmail }] = await Promise.all([
                import('@/services/firebaseService'),
                import('@/features/auth/services/authService'),
            ]);

            if (!mounted) return;

            unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    dispatch(loginSuccess({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role: isAdminEmail(user.email) ? 'admin' : 'user'
                    }));
                } else {
                    // User is signed out.
                    dispatch(logout());
                }
            });
        })().catch((error) => {
            console.error('Auth listener bootstrap failed:', error);
        });

        // Cleanup subscription on unmount
        return () => {
            mounted = false;
            unsubscribe?.();
        };
    }, [dispatch]);
};
