import type { Node, Edge } from '@xyflow/react'

export type Base = 2 | 10 | 16

export interface ConversionStep {
  stepNumber: number
  operation: string
  value: string
  remainder?: string
  integerPart?: string
  mantissa?: string
  highlight?: string[]
}

export type LogicGateType =
  | 'BUFFER'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'CONSTANT'
  | 'OUTPUT'
  | 'INPUT'

export interface LogicGateData {
  gateType: LogicGateType
  label: string
  inputCount: number
  constantValue?: 0 | 1
}

export type SignalValue = 0 | 1 | null
export type SignalMap = Record<string, SignalValue>

export interface TruthTableRow {
  inputs: Record<string, 0 | 1>
  output: 0 | 1
}

export interface KarnaughCell {
  minterm: number
  value: 0 | 1
  groupIds: string[]
}

export interface KarnaughGroup {
  id: string
  cells: number[]
  color: string
  expression: string
}

export interface SavedCircuit {
  id: string
  name: string
  createdAt: string
  nodes: Node[]
  edges: Edge[]
}

export interface HistoryEntry {
  nodes: Node[]
  edges: Edge[]
}

export type Route = '/numeral' | '/logic' | '/boolean' | '/reference' | '/settings'

export interface ElectronAPI {
  saveCircuit: (payload: { name: string; data: string }) => Promise<{ success: boolean; error?: string }>
  loadCircuit: () => Promise<{ success: boolean; data?: string; error?: string }>
  copyToClipboard: (text: string) => Promise<boolean>
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
