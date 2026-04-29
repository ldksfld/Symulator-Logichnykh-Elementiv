import React from 'react'
import { uk } from '../../../i18n/uk'
import type { LogicGateType } from '../../../types'
import { X } from 'lucide-react'

const TRUTH_TABLES: Record<LogicGateType, { inputs: (0|1)[][]; output: (0|1)[] }> = {
  BUFFER:   { inputs: [[0],[1]],                         output: [0,1] },
  NOT:      { inputs: [[0],[1]],                         output: [1,0] },
  AND:      { inputs: [[0,0],[0,1],[1,0],[1,1]],         output: [0,0,0,1] },
  OR:       { inputs: [[0,0],[0,1],[1,0],[1,1]],         output: [0,1,1,1] },
  NAND:     { inputs: [[0,0],[0,1],[1,0],[1,1]],         output: [1,1,1,0] },
  NOR:      { inputs: [[0,0],[0,1],[1,0],[1,1]],         output: [1,0,0,0] },
  XOR:      { inputs: [[0,0],[0,1],[1,0],[1,1]],         output: [0,1,1,0] },
  CONSTANT: { inputs: [],                                output: [] },
  OUTPUT:   { inputs: [[0],[1]],                         output: [0,1] },
  INPUT:    { inputs: [[0],[1]],                         output: [0,1] },
}

interface Props {
  gateType: LogicGateType
  onClose: () => void
}

export default function GateHelpPanel({ gateType, onClose }: Props) {
  const tt = TRUTH_TABLES[gateType]

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
