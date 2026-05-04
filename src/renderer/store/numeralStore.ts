import { create } from 'zustand'
import type { Base, ConversionStep } from '../types'

interface NumeralState {
  inputValue: string
  inputBase: Base
  outputBase: Base
  steps: ConversionStep[]
  result: string
  fractionDigits: number
  error: string | null
  isInfinite: boolean
  currentStepIndex: number

  setInputValue: (v: string) => void
  setInputBase: (b: Base) => void
  setOutputBase: (b: Base) => void
  setConversionResult: (result: string, steps: ConversionStep[], isInfinite: boolean) => void
  setError: (err: string | null) => void
  setFractionDigits: (n: number) => void
  setCurrentStepIndex: (i: number) => void
  clear: () => void
}

export const useNumeralStore = create<NumeralState>()((set) => ({
  inputValue: '',
  inputBase: 10,
  outputBase: 2,
  steps: [],
  result: '',
  fractionDigits: 8,
  error: null,
  isInfinite: false,
  currentStepIndex: -1,

  setInputValue: (inputValue) => set({ inputValue }),
  setInputBase: (inputBase) => set({ inputBase }),
  setOutputBase: (outputBase) => set({ outputBase }),
  setConversionResult: (result, steps, isInfinite) =>
    set({ result, steps, isInfinite, error: null, currentStepIndex: -1 }),
  setError: (error) => set({ error, result: '', steps: [] }),
  setFractionDigits: (fractionDigits) => set({ fractionDigits }),
  setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),
  clear: () =>
    set({
      inputValue: '',
      steps: [],
      result: '',
      error: null,
      isInfinite: false,
      currentStepIndex: -1,
    }),
}))
