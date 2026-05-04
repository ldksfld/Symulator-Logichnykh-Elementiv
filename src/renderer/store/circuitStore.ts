import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import type { Node, Edge } from '@xyflow/react'
import type { SignalMap, HistoryEntry } from '../types'

const MAX_HISTORY = 30

interface CircuitState {
  nodes: Node[]
  edges: Edge[]
  simulationState: SignalMap
  isSimulating: boolean
  stepSimulation: boolean
  stepIndex: number
  stepOrder: string[]
  past: HistoryEntry[]
  future: HistoryEntry[]
  hasCycle: boolean

  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
  setSimulationState: (state: SignalMap) => void
  setIsSimulating: (v: boolean) => void
  setHasCycle: (v: boolean) => void
  startStepSimulation: (order: string[]) => void
  advanceStep: () => void
  stopStepSimulation: () => void
  pushHistory: () => void
  syncFromCanvas: (nodes: Node[], edges: Edge[]) => void
  undo: () => void
  redo: () => void
  clearCanvas: () => void
  loadCircuit: (nodes: Node[], edges: Edge[]) => void
}

export const useCircuitStore = create<CircuitState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      simulationState: {},
      isSimulating: false,
      stepSimulation: false,
      stepIndex: -1,
      stepOrder: [],
      past: [],
      future: [],
      hasCycle: false,

      setNodes: (nodes) =>
        set((s) => ({ nodes: typeof nodes === 'function' ? nodes(s.nodes) : nodes })),

      setEdges: (edges) =>
        set((s) => ({ edges: typeof edges === 'function' ? edges(s.edges) : edges })),

      setSimulationState: (simulationState) => set({ simulationState }),

      setIsSimulating: (isSimulating) => set({ isSimulating }),

      setHasCycle: (hasCycle) => set({ hasCycle }),

      startStepSimulation: (order) =>
        set({ stepSimulation: true, stepIndex: 0, stepOrder: order }),

      advanceStep: () =>
        set((s) => ({
          stepIndex: Math.min(s.stepIndex + 1, s.stepOrder.length - 1),
        })),

      stopStepSimulation: () =>
        set({ stepSimulation: false, stepIndex: -1, stepOrder: [] }),

      pushHistory: () =>
        set(
          produce((s: CircuitState) => {
            const entry: HistoryEntry = {
              nodes: JSON.parse(JSON.stringify(s.nodes)),
              edges: JSON.parse(JSON.stringify(s.edges)),
            }

            s.past.push(entry)

            if (s.past.length > MAX_HISTORY) {
              s.past.shift()
            }

            s.future = []
          })
        ),

      syncFromCanvas: (nodes, edges) =>
        set({ nodes, edges }),

      undo: () =>
        set(
          produce((s: CircuitState) => {
            if (s.past.length === 0) {
              return
            }

            const current: HistoryEntry = {
              nodes: JSON.parse(JSON.stringify(s.nodes)),
              edges: JSON.parse(JSON.stringify(s.edges)),
            }
            const prev = s.past.pop()!

            s.future.push(current)
            s.nodes = prev.nodes
            s.edges = prev.edges
          })
        ),

      redo: () =>
        set(
          produce((s: CircuitState) => {
            if (s.future.length === 0) {
              return
            }

            const current: HistoryEntry = {
              nodes: JSON.parse(JSON.stringify(s.nodes)),
              edges: JSON.parse(JSON.stringify(s.edges)),
            }
            const next = s.future.pop()!

            s.past.push(current)
            s.nodes = next.nodes
            s.edges = next.edges
          })
        ),

      clearCanvas: () =>
        set((s) => {
          const current: HistoryEntry = {
            nodes: JSON.parse(JSON.stringify(s.nodes)),
            edges: JSON.parse(JSON.stringify(s.edges)),
          }

          const past = s.nodes.length > 0 || s.edges.length > 0 ? [...s.past, current] : s.past
          return { nodes: [], edges: [], simulationState: {}, isSimulating: false, hasCycle: false, past, future: [] }
        }),

      loadCircuit: (nodes, edges) => set({ nodes, edges, simulationState: {} }),
    }),
    {
      name: 'sleschi-circuit',
      partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
    }
  )
)
