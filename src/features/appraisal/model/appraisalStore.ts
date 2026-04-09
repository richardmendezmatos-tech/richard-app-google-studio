import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';

export const vehicleSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Año inválido'),
  make: z.string().min(2, 'Marca requerida'),
  model: z.string().min(2, 'Modelo requerido'),
  mileage: z.string().regex(/^\d+$/, 'Kilometraje inválido'),
  condition: z.enum(['excelente', 'bueno', 'regular', 'pobre']),
  vin: z.string().length(17, 'VIN debe tener 17 caracteres').optional().or(z.literal('')),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(10, 'Teléfono válido requerido (min 10 dígitos)').regex(/^[0-9\-+()\s]+$/, 'Teléfono inválido'),
});

export type VehicleData = z.infer<typeof vehicleSchema>;
export type ContactData = z.infer<typeof contactSchema>;

interface AppraisalState {
  step: number;
  formData: VehicleData;
  contactData: ContactData;
  isOffline: boolean;
  errors: Partial<Record<keyof VehicleData | keyof ContactData, string>>;
  
  // Actions
  setStep: (step: number) => void;
  updateFormData: (data: Partial<VehicleData>) => void;
  updateContactData: (data: Partial<ContactData>) => void;
  setOffline: (status: boolean) => void;
  reset: () => void;
  validateStep: (step: number) => boolean;
}

const initialFormData: VehicleData = {
  year: '',
  make: '',
  model: '',
  mileage: '',
  condition: 'excelente',
  vin: ''
};

const initialContactData: ContactData = {
  name: '',
  phone: ''
};

export const useAppraisalStore = create<AppraisalState>()(
  persist(
    (set) => ({
      step: 1,
      formData: initialFormData,
      contactData: initialContactData,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      errors: {},

      setStep: (step) => set({ step }),
      updateFormData: (data) => set((state) => ({ 
        formData: { ...state.formData, ...data },
        errors: Object.keys(data).reduce((acc, key) => {
          const { [key as keyof VehicleData]: _, ...rest } = acc;
          return rest;
        }, state.errors as any)
      })),
      updateContactData: (data) => set((state) => ({ 
        contactData: { ...state.contactData, ...data },
        errors: Object.keys(data).reduce((acc, key) => {
          const { [key as keyof ContactData]: _, ...rest } = acc;
          return rest;
        }, state.errors as any)
      })),
      setOffline: (isOffline) => set({ isOffline }),
      reset: () => set({ step: 1, formData: initialFormData, contactData: initialContactData, errors: {} }),
      validateStep: (step) => {
        const state = (useAppraisalStore.getState() as any);
        const { formData, contactData } = state;
        
        try {
          if (step === 1) {
            vehicleSchema.pick({ year: true, make: true, model: true }).parse(formData);
          } else if (step === 2) {
            vehicleSchema.pick({ mileage: true, condition: true }).parse(formData);
          } else if (step === 4) {
             contactSchema.parse(contactData);
          }
          set({ errors: {} });
          return true;
        } catch (err) {
          if (err instanceof z.ZodError) {
            const newErrors: any = {};
            err.errors.forEach((e) => {
              if (e.path[0]) newErrors[e.path[0]] = e.message;
            });
            set({ errors: newErrors });
          }
          return false;
        }
      }
    }),
    {
      name: 'ra-appraisal-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);
