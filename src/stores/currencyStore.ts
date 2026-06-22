import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const REGIONS = [
  { id: 'in', code: 'INR', symbol: '₹', label: 'India (INR)' },
  { id: 'us', code: 'USD', symbol: '$', label: 'United States (USD)' },
  { id: 'ae', code: 'AED', symbol: 'د.إ', label: 'UAE (AED)' },
  { id: 'vn', code: 'VND', symbol: '₫', label: 'Vietnam (VND)' },
];

export interface CurrencyState {
  regionId: string;
  rates: Record<string, number>;
  setRegion: (id: string) => void;
  setRates: (rates: Record<string, number>) => void;
  fetchRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      regionId: 'in', // Default to INR
      rates: { INR: 1 }, // Default base rate
      setRegion: (id) => set({ regionId: id }),
      setRates: (rates) => set({ rates }),
      fetchRates: async () => {
        try {
          // You can replace this with a real API like exchangerate-api
          // For now, using standard approx rates base=INR
          const mockRates = {
            INR: 1,
            USD: 0.012, // 1 INR = 0.012 USD
            AED: 0.044, // 1 INR = 0.044 AED
            VND: 300,   // 1 INR = 300 VND
          };
          set({ rates: mockRates });
        } catch (error) {
          console.error('Failed to fetch currency rates:', error);
        }
      },
    }),
    {
      name: 'plumtrips-currency-storage',
    }
  )
);
