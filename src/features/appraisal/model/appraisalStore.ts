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

export type VehicleData = z.infer<typeof vehicleSchema>;

interface AppraisalState {
  step: number;
  formData: VehicleData;
  isOffline: boolean;
  errors: Partial<Record<keyof VehicleData, string>>;
  
  // Actions
  setStep: (step: number) => void;
  updateFormData: (data: Partial<VehicleData>) => void;
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

export const useAppraisalStore = create<AppraisalState>()(
  persist(
    (set) => ({
      step: 1,
      formData: initialFormData,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      errors: {},

      setStep: (step) => set({ step }),
      updateFormData: (data) => set((state) => ({ 
        formData: { ...state.formData, ...data },
        // Clear error when field changes
        errors: Object.keys(data).reduce((acc, key) => {
          const { [key as keyof VehicleData]: _, ...rest } = acc;
          return rest;
        }, state.errors)
      })),
      setOffline: (isOffline) => set({ isOffline }),
      reset: () => set({ step: 1, formData: initialFormData, errors: {} }),
      validateStep: (step) => {
        const state = (useAppraisalStore.getState() as any);
        const data = state.formData;
        
        try {
          if (step === 1) {
            vehicleSchema.pick({ year: true, make: true, model: true }).parse(data);
          } else if (step === 2) {
            vehicleSchema.pick({ mileage: true, condition: true }).parse(data);
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
      storage: createJSONStorage(() => localStorage), // can switch to IndexedDB if needed
    }
  )
);
