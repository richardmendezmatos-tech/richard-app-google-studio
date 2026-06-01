import { SMSRepository } from '@/shared/api/repositories/ISMSRepository';
import { sendTwilioMessage } from '@/shared/api/communications/TwilioAdapter';

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
