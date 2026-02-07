
import axios from 'axios';

/**
 * WhatsAppService
 * Bridges the frontend CRM with the Twilio-backed Omnichannel API.
 */
class WhatsAppService {
    private readonly API_URL = '/api/send-whatsapp'; // Vercel Serverless Function

    /**
     * Sends a real WhatsApp message via Twilio.
     * @param to Phone number in E.164 format (no + prefix needed, will be added if missing)
     * @param message Text message content
     * @param mediaUrl Optional image/video URL
     */
    async sendMessage(to: string, message: string, mediaUrl?: string): Promise<boolean> {
        try {
            // Clean phone number
            const cleanTo = to.startsWith('+') ? to.substring(1) : to;

            console.log(`[WhatsAppService] Attempting to send message to ${cleanTo}...`);

            const response = await axios.post(this.API_URL, {
                to: cleanTo,
                message,
                mediaUrl
            });

            if (response.data?.success) {
                console.log(`[WhatsAppService] Message sent successfully: ${response.data.sid}`);
                return true;
            } else {
                console.error('[WhatsAppService] Error sending message:', response.data?.error);
                return false;
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[WhatsAppService] Fatal error:', errorMessage);
            return false;
        }
    }

    /**
     * Generates a direct WhatsApp link for manual fallback if API fails.
     */
    getFallbackLink(to: string, message: string): string {
        const cleanTo = to.replace(/\D/g, '');
        const encodedMsg = encodeURIComponent(message);
        return `https://wa.me/${cleanTo}?text=${encodedMsg}`;
    }
}

export const whatsappService = new WhatsAppService();
