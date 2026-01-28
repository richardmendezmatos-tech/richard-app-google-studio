import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import { loginSuccess, logout } from '../store/slices/authSlice';
import { isAdminEmail } from '../services/authService';

export const useAuthListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [dispatch]);
};
