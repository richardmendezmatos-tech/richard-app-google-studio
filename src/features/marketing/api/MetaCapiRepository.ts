import { MetaRepository } from '@/features/marketing/api';
import { sendMetaLeadEvent } from '@/features/marketing/api/MetaCapiAdapter';

export class MetaCapiRepository implements MetaRepository {
  async sendLeadEvent(email?: string, phone?: string, data?: any): Promise<boolean> {
    try {
      await sendMetaLeadEvent(email, phone, data);
      return true;
    } catch (error) {
      console.error('MetaCapiRepository Error:', error);
      return false;
    }
  }
}
