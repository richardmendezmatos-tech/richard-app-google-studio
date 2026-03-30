import { getCookie, setCookie } from '@/shared/api/tracking/cookieService';
import { Appraisal } from '../model/types';

export const appraisalService = {
  getAppraisals(): Appraisal[] {
    try {
      const appraisals = getCookie('richard_appraisals');
      if (!appraisals) return [];
      const parsed = JSON.parse(appraisals);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveAppraisal(appraisal: Appraisal): Appraisal[] {
    const current = this.getAppraisals();
    const updated = [appraisal, ...current].slice(0, 5); // Keep last 5
    setCookie('richard_appraisals', JSON.stringify(updated), 30);
    return updated;
  },
};
