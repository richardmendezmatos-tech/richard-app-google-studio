import { getCookie, setCookie } from '@/shared/api/tracking/cookieService';
import { Appraisal, FinancialApplication } from '@/shared/types/types';

export const garageService = {
  getSavedCarIds(): string[] {
    try {
      const savedIds = getCookie('richard_saved_cars');
      if (!savedIds) return [];
      const parsed = JSON.parse(savedIds);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  toggleSavedCar(carId: string): string[] {
    const saved = this.getSavedCarIds();
    const isSaved = saved.includes(carId);
    let updated;
    if (isSaved) {
      updated = saved.filter((id) => id !== carId);
    } else {
      updated = [...saved, carId];
    }
    // Update cookie with 30 days expiration
    setCookie('richard_saved_cars', JSON.stringify(updated), 30);
    return updated;
  },
  getFinancialApplications(): FinancialApplication[] {
    try {
      const apps = getCookie('richard_financial_apps');
      if (!apps) return [];
      const parsed = JSON.parse(apps);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveFinancialApplication(app: FinancialApplication): FinancialApplication[] {
    const current = this.getFinancialApplications();
    const updated = [app, ...current].slice(0, 5); // Keep last 5
    setCookie('richard_financial_apps', JSON.stringify(updated), 30);
    return updated;
  },
};
