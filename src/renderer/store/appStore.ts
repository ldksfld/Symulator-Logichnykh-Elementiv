import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Route, SavedCircuit } from '../types'

interface AppState {
  theme: 'light' | 'dark'
  fontSize: number
  activeModule: Route
  savedCircuits: SavedCircuit[]

  setTheme: (theme: 'light' | 'dark') => void
  setFontSize: (size: number) => void
  setActiveModule: (module: Route) => void
  addSavedCircuit: (circuit: SavedCircuit) => void
  removeSavedCircuit: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 14,
      activeModule: '/numeral',
      savedCircuits: [],

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setActiveModule: (activeModule) => set({ activeModule }),
      addSavedCircuit: (circuit) =>
        set((s) => ({ savedCircuits: [...s.savedCircuits, circuit] })),
      removeSavedCircuit: (id) =>
        set((s) => ({ savedCircuits: s.savedCircuits.filter((c) => c.id !== id) })),
    }),
    {
      name: 'sleschi-app-settings',
      partialize: (s) => ({ theme: s.theme, fontSize: s.fontSize, savedCircuits: s.savedCircuits }),
    }
  )
)
