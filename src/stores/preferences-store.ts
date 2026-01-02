import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesStore {
  locale: string;
  currency: string;
  measurementUnit: 'metric' | 'imperial';
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
  setMeasurementUnit: (unit: 'metric' | 'imperial') => void;
}

/**
 * Store de preferências do usuário
 * Persiste no localStorage
 */
export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      locale: 'pt-BR',
      currency: 'BRL',
      measurementUnit: 'metric',

      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setMeasurementUnit: (measurementUnit) => set({ measurementUnit }),
    }),
    {
      name: 'lume-preferences-storage',
    }
  )
);
