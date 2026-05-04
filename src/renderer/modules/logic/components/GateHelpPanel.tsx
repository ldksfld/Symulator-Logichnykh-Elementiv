import React from 'react'
import { uk } from '../../../i18n/uk'
import type { LogicGateType } from '../../../types'
import { X } from 'lucide-react'
import { useCircuitStore } from '../../../store/circuitStore'

function buildTruthTable(
  gateType: LogicGateType,
  inputCount: number
): { inputs: (0|1)[][]; output: (0|1)[] } {
  if (gateType === 'CONSTANT') {
    return { inputs: [], output: [] }
  }

  const n = Math.max(1, inputCount)
  const total = 1 << n
  const inputs: (0|1)[][] = []
  const output: (0|1)[] = []

  for (let combo = 0; combo < total; combo++) {
    const row: (0|1)[] = []

    for (let i = 0; i < n; i++) {
      row.push(((combo >> (n - 1 - i)) & 1) as 0|1)
    }

    inputs.push(row)
    let y: 0|1 = 0

    switch (gateType) {
      case 'BUFFER':
      case 'INPUT':
      case 'OUTPUT':
        y = row[0]
        break
      case 'NOT':
        y = (row[0] === 0 ? 1 : 0) as 0|1
        break
      case 'AND':
        y = (row.every((v) => v === 1) ? 1 : 0) as 0|1
        break
      case 'OR':
        y = (row.some((v) => v === 1) ? 1 : 0) as 0|1
        break
      case 'NAND':
        y = (row.every((v) => v === 1) ? 0 : 1) as 0|1
        break
      case 'NOR':
        y = (row.some((v) => v === 1) ? 0 : 1) as 0|1
        break
      case 'XOR':
        y = (row.reduce((acc: number, v) => acc ^ v, 0) & 1) as 0|1
        break
    }

    output.push(y)
  }

  return { inputs, output }
}

interface Props {
  gateType: LogicGateType
  nodeId?: string
  onClose: () => void
}

const MULTI_INPUT: LogicGateType[] = ['AND', 'OR', 'NAND', 'NOR', 'XOR']

export default function GateHelpPanel({ gateType, nodeId, onClose }: Props) {
  const nodes = useCircuitStore((s) => s.nodes)
  const setNodes = useCircuitStore((s) => s.setNodes)
  const pushHistory = useCircuitStore((s) => s.pushHistory)

  const targetNode = nodeId ? nodes.find((n) => n.id === nodeId) : undefined
  const currentInputCount = targetNode
    ? Number((targetNode.data as Record<string, unknown>).inputCount ?? 2)
    : 2
  const canEditInputs = !!targetNode && MULTI_INPUT.includes(gateType)
  const ttInputCount = MULTI_INPUT.includes(gateType)
    ? currentInputCount
    : gateType === 'CONSTANT'
    ? 0
    : 1
  const tt = buildTruthTable(gateType, ttInputCount)

  const handleInputCountChange = (val: number) => {
    if (!nodeId) {
      return
    }

    const clamped = Math.max(2, Math.min(8, val))

    pushHistory()
    setNodes((arr) =>
      arr.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, inputCount: clamped } }
          : n
      )
    )
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{uk.logic.helpPanel}</h3>
        <button
          className="btn-ghost p-1"
          onClick={onClose}
          aria-label={uk.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {uk.logic.gates[gateType]}
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-200">
          {uk.logic.gateDesc[gateType]}
        </div>
      </div>

      {canEditInputs && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400" htmlFor="gate-inputs">
            {uk.logic.inputCount}:
          </label>
          <input
            id="gate-inputs"
            type="number"
            min={2}
            max={8}
            value={currentInputCount}
            onChange={(e) => handleInputCountChange(parseInt(e.target.value) || 2)}
            className="input w-16 py-0.5"
            aria-label={uk.logic.inputCount}
          />
        </div>
      )}

      {tt.inputs.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {uk.reference.logicGates}
          </div>
          <table className="table-base text-xs">
            <thead>
              <tr>
                {tt.inputs[0].map((_, i) => <th key={i}>x{i+1}</th>)}
                <th>Y</th>
              </tr>
            </thead>
            <tbody>
              {tt.inputs.map((row, i) => (
                <tr key={i}>
                  {row.map((v, j) => (
                    <td key={j} className={`font-mono text-center ${v === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {v}
                    </td>
                  ))}
                  <td className={`font-mono text-center font-bold ${tt.output[i] === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tt.output[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
