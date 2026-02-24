import { SMSRepository } from '../../domain/repositories/SMSRepository';
import { sendTwilioMessage } from '../../services/twilioService';

export class TwilioSMSRepository implements SMSRepository {
    async send(to: string, message: string): Promise<boolean> {
        try {
            await sendTwilioMessage(to, message);
            return true;
        } catch (error) {
            console.error('TwilioSMSRepository Error:', error);
            return false;
        }
    }
}
