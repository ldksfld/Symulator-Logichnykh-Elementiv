import React from 'react'
import type { Node } from '@xyflow/react'
import { useCircuitStore } from '../../../store/circuitStore'
import { uk } from '../../../i18n/uk'
import { clsx } from 'clsx'

interface Props {
  nodes: Node[]
}

export default function InputsPanel({ nodes }: Props) {
  const setNodes = useCircuitStore((s) => s.setNodes)

  const inputs = nodes.filter((n) => {
    const d = n.data as Record<string, unknown>
    return d.gateType === 'INPUT' || d.gateType === 'CONSTANT'
  })

  if (inputs.length === 0) {
    return null
  }

  const toggle = (id: string) => {
    setNodes((arr) =>
      arr.map((n) => {
        if (n.id !== id) {
          return n
        }

        const d = n.data as Record<string, unknown>
        const cur = ((d.gateType === 'INPUT' ? d.inputValue : d.constantValue) ?? 0) as 0 | 1
        const next: 0 | 1 = cur === 0 ? 1 : 0

        return {
          ...n,
          data: {
            ...n.data,
            inputValue: next,
            constantValue: next,
          },
        }
      })
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {uk.logic.inputs}
      </h3>
      <div className="flex flex-col gap-1.5">
        {inputs.map((n) => {
          const d = n.data as Record<string, unknown>
          const isConst = d.gateType === 'CONSTANT'
          const value = ((isConst ? d.constantValue : d.inputValue) ?? 0) as 0 | 1
          const label = String(d.label ?? n.id)
          return (
            <div
              key={n.id}
              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
            >
              <span className="text-xs font-mono text-gray-700 dark:text-gray-200 truncate">
                {isConst ? '=' : ''} {label}
              </span>
              <button
                onClick={() => toggle(n.id)}
                aria-label={`${label}: ${value}`}
                className={clsx(
                  'font-mono font-bold text-xs px-2.5 py-1 rounded transition-colors min-w-[36px]',
                  value === 1
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                )}
              >
                {value}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
