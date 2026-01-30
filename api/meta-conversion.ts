
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { eventName, data, url } = req.body;
    const PIXEL_ID = process.env.VITE_META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.warn('Missing Meta Credentials');
        return res.status(500).json({ message: 'Server Config Missing' });
    }

    try {
        const eventData = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    event_source_url: url,
                    user_data: {
                        client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                        client_user_agent: req.headers['user-agent'],
                        // Hashed external ID if available in request body
                        external_id: data?.external_id
                    },
                    custom_data: data
                }
            ]
        };

        const response = await fetch(
            `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error('Meta CAPI Error:', result);
            return res.status(response.status).json(result);
        }

        return res.status(200).json({ success: true, id: result.fbtrace_id });

    } catch (error) {
        console.error('CAPI Exception:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
