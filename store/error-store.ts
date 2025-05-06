import { ApiError } from '@/api/api-controller';
import { create } from 'zustand';

interface ErrorState {
  error: ApiError | null;
  setError: (error: ApiError | null) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));