import { create } from 'zustand'
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
  history: HistoryEntry[]
  historyIndex: number
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
  undo: () => void
  redo: () => void
  clearCanvas: () => void
  loadCircuit: (nodes: Node[], edges: Edge[]) => void
}

export const useCircuitStore = create<CircuitState>()((set, get) => ({
  nodes: [],
  edges: [],
  simulationState: {},
  isSimulating: false,
  stepSimulation: false,
  stepIndex: -1,
  stepOrder: [],
  history: [],
  historyIndex: -1,
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
        s.history = s.history.slice(0, s.historyIndex + 1)
        s.history.push(entry)
        if (s.history.length > MAX_HISTORY) s.history.shift()
        s.historyIndex = s.history.length - 1
      })
    ),

  undo: () =>
    set(
      produce((s: CircuitState) => {
        if (s.historyIndex <= 0) return
        s.historyIndex -= 1
        const entry = s.history[s.historyIndex]
        s.nodes = JSON.parse(JSON.stringify(entry.nodes))
        s.edges = JSON.parse(JSON.stringify(entry.edges))
      })
    ),

  redo: () =>
    set(
      produce((s: CircuitState) => {
        if (s.historyIndex >= s.history.length - 1) return
        s.historyIndex += 1
        const entry = s.history[s.historyIndex]
        s.nodes = JSON.parse(JSON.stringify(entry.nodes))
        s.edges = JSON.parse(JSON.stringify(entry.edges))
      })
    ),

  clearCanvas: () =>
    set({ nodes: [], edges: [], simulationState: {}, isSimulating: false, hasCycle: false }),

  loadCircuit: (nodes, edges) => set({ nodes, edges, simulationState: {} }),
}))
