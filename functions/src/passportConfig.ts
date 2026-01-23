import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const configurePassport = () => {
    // 1. Session Serialization
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const userDoc = await db.collection('users').doc(id).get();
            if (userDoc.exists) {
                done(null, { id: userDoc.id, ...userDoc.data() });
            } else {
                done(null, false);
            }
        } catch (err) {
            done(err);
        }
    });

    // 2. Local Strategy
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
            if (snapshot.empty) {
                return done(null, false, { message: 'User not found' });
            }

            const user = snapshot.docs[0].data();
            user.id = snapshot.docs[0].id;

            // IMPORTANT: In a real app, use bcrypt or similar to verify password
            // For this integration demo, we assume a "passport_token" or simple match 
            // if we were storing custom passwords.
            if (password === 'richard2026') { // Mock validation for demo
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        } catch (err) {
            return done(err);
        }
    }));
};
