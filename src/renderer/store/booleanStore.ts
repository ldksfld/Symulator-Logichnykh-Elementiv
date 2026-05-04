import { create } from 'zustand'
import type { TruthTableRow, KarnaughCell, KarnaughGroup } from '../types'

interface BooleanState {
  expression: string
  expression2: string
  variables: string[]
  truthTable: TruthTableRow[]
  karnaughCells: KarnaughCell[]
  karnaughGroups: KarnaughGroup[]
  simplifiedExpr: string
  dnf: string
  cnf: string
  simplificationSteps: string[]
  error: string | null
  identityResult: boolean | null

  setExpression: (e: string) => void
  setExpression2: (e: string) => void
  setResult: (data: {
    variables: string[]
    truthTable: TruthTableRow[]
    karnaughCells: KarnaughCell[]
    karnaughGroups: KarnaughGroup[]
    simplifiedExpr: string
    dnf: string
    cnf: string
    simplificationSteps: string[]
  }) => void
  setError: (e: string | null) => void
  setIdentityResult: (r: boolean | null) => void
  clear: () => void
}

export const useBooleanStore = create<BooleanState>()((set) => ({
  expression: '',
  expression2: '',
  variables: [],
  truthTable: [],
  karnaughCells: [],
  karnaughGroups: [],
  simplifiedExpr: '',
  dnf: '',
  cnf: '',
  simplificationSteps: [],
  error: null,
  identityResult: null,

  setExpression: (expression) => set({ expression }),
  setExpression2: (expression2) => set({ expression2 }),
  setResult: (data) => set({ ...data, error: null }),
  setError: (error) => set({ error }),
  setIdentityResult: (identityResult) => set({ identityResult }),
  clear: () =>
    set({
      expression: '',
      expression2: '',
      variables: [],
      truthTable: [],
      karnaughCells: [],
      karnaughGroups: [],
      simplifiedExpr: '',
      dnf: '',
      cnf: '',
      simplificationSteps: [],
      error: null,
      identityResult: null,
    }),
}))
