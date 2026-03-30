export interface Appraisal {
  id: string;
  date: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    vin?: string;
  };
  condition: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    details: string[];
  };
  value: {
    estimated: number;
    currency: string;
    validUntil: string; // ISO string
  };
  status: 'valid' | 'expired' | 'certified';
}
