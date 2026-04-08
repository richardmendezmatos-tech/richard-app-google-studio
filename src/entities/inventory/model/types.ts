import { z } from 'zod';

export type CarType = 'suv' | 'sedan' | 'luxury' | 'pickup' | string;

export interface Car {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  vin: string;
  color: string;
  price: number;
  image: string; // Lead image
  img?: string; // Legacy field support
  type: CarType;
  transmission?: string;
  fuel?: string;
  fuelType?: string;
  engine?: string;
  hp?: number;
  acceleration?: string;
  topSpeed?: number;
  description?: string;
  features?: string[];
  specs?: {
    label: string;
    value: string;
  }[];
  gallery?: string[];
  images?: string[]; // Multiple source support
  status: 'available' | 'reserved' | 'sold';
  inventoryId?: string;
  createdAt?: any;
  
  // Storefront & Marketing
  badge?: string;
  webpSrc?: string;
  blurPlaceholder?: string;
  featured?: boolean;
  mileage?: number;
  
  // Analytics
  views?: number;
  leads_count?: number;
  dealerId?: string;
  
  // SEO
  seoFaqs?: { question: string; answer: string }[];
}

export const calculatePredictiveDTS = (car: any) => {
  const baseRate = 45;
  const priceAdjustment = car.price < 25000 ? -5 : 5;
  const brandAdjustment = car.make === 'Toyota' || car.make === 'Honda' ? -10 : 0;
  const score = Math.max(15, baseRate + priceAdjustment + brandAdjustment);
  return { advantageScore: score };
};

export const CarSchema = z.object({
  id: z.string(),
  name: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  price: z.number(),
  status: z.enum(['available', 'reserved', 'sold']),
});
