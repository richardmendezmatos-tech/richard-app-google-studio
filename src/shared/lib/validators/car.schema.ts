import { z } from 'zod';
import type { CarType } from '@/shared/types/types';

export const carTypeSchema = z.enum(['suv', 'sedan', 'luxury', 'pickup'] as const);

export const carSchema = z.object({
  id: z.string().optional(), // Puede ser opcional antes de insertarse
  name: z.string().min(2, 'Name is too short').max(100, 'Name is too long'),
  price: z.number().min(0, 'Price cannot be negative'),
  type: carTypeSchema,
  badge: z.string().optional(),
  img: z.string().url('Invalid image URL').or(z.string().min(1, 'Path required')),
  webpSrc: z.string().optional(),
  blurPlaceholder: z.string().optional(),
  images: z.array(z.string()).optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  mileage: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  views: z.number().min(0).optional(),
  leads_count: z.number().min(0).optional(),
  dealerId: z.string().optional(),
  seoFaqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).optional(),
});

export type CarInput = z.infer<typeof carSchema>;
