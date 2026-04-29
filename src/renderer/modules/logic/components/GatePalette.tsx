import React from 'react'
import { uk } from '../../../i18n/uk'
import type { LogicGateType } from '../../../types'

const PALETTE_ITEMS: { type: LogicGateType; inputs: 2 | 1 | 0 }[] = [
  { type: 'INPUT',    inputs: 0 },
  { type: 'CONSTANT', inputs: 0 },
  { type: 'BUFFER',   inputs: 1 },
  { type: 'NOT',      inputs: 1 },
  { type: 'AND',      inputs: 2 },
  { type: 'OR',       inputs: 2 },
  { type: 'NAND',     inputs: 2 },
  { type: 'NOR',      inputs: 2 },
  { type: 'XOR',      inputs: 2 },
  { type: 'OUTPUT',   inputs: 1 },
]

const SYMBOLS: Record<LogicGateType, string> = {
  INPUT: 'IN', CONSTANT: '=', BUFFER: '▷', NOT: '▷○',
  AND: '&', OR: '≥1', NAND: '&○', NOR: '≥1○', XOR: '=1', OUTPUT: 'OUT',
}

interface Props {
  onDragStart: (type: LogicGateType) => void
}

export default function GatePalette({ onDragStart }: Props) {
  const handleDragStart = (e: React.DragEvent, type: LogicGateType) => {
    e.dataTransfer.setData('application/gateType', type)
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart(type)
  }

  return (
    <div className="p-2">
      <h3 className="section-title text-xs mb-2">{uk.logic.palette}</h3>
      <div className="flex flex-col gap-1.5">
        {PALETTE_ITEMS.map(({ type }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            className="flex items-center gap-2 px-2 py-2 rounded border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-800 cursor-grab hover:border-accent-400 hover:bg-accent-50
                       dark:hover:bg-accent-900/20 transition-colors select-none"
            title={uk.logic.gateDesc[type]}
            aria-label={`Перетягніть: ${uk.logic.gates[type]}`}
          >
            <span className="font-mono text-sm font-bold text-accent-600 dark:text-accent-400 w-8 text-center flex-shrink-0">
              {SYMBOLS[type]}
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300 leading-tight">
              {uk.logic.gates[type]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
        {uk.logic.hint.drag}
      </div>
    </div>
  )
}
