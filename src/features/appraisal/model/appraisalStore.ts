import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppraisalFormData {
  year: string;
  make: string;
  model: string;
  mileage: string;
  condition: string;
  vin: string;
}

interface AppraisalState {
  step: number;
  formData: AppraisalFormData;
  isOffline: boolean;
  
  // Actions
  setStep: (step: number) => void;
  updateFormData: (data: Partial<AppraisalFormData>) => void;
  setOffline: (status: boolean) => void;
  reset: () => void;
}

const initialFormData: AppraisalFormData = {
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
      isOffline: !navigator.onLine,

      setStep: (step) => set({ step }),
      updateFormData: (data) => set((state) => ({ 
        formData: { ...state.formData, ...data } 
      })),
      setOffline: (isOffline) => set({ isOffline }),
      reset: () => set({ step: 1, formData: initialFormData })
    }),
    {
      name: 'ra-appraisal-storage', // unique name
      storage: createJSONStorage(() => localStorage), // can switch to IndexedDB if needed
    }
  )
);
