
import * as functions from 'firebase-functions';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';

// Initialize OAuth2Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const corsHandler = cors({ origin: true }); // Enable CORS for frontend

/**
 * Endpoint POST para verificar Google ID Tokens
 * Validates integrity, expiration, and audience (Client ID)
 */
export const verifyGoogleToken = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const { credential } = req.body;

        if (!credential) {
            res.status(400).send('Missing credential token');
            return;
        }

        try {
            // "Senior" Step: Verify the token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID, // Specify Client ID to prevent "confused deputy" attacks
            });

            const payload = ticket.getPayload();

            if (!payload) {
                throw new Error('Invalid Token Payload');
            }

            // Optional: Check nonce if implemented in frontend generation
            // if (payload.nonce !== expectedNonce) ...

            // Respond with verified user data
            res.status(200).json({
                verified: true,
                uid: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                expires_at: payload.exp
            });

        } catch (error: any) {
            console.error('Token verification failed:', error);
            res.status(401).json({
                verified: false,
                error: 'Invalid Token',
                details: error.message
            });
        }
    });
});
