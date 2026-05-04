import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { useCircuitStore } from '../../../store/circuitStore'
import { uk } from '../../../i18n/uk'
import type { LogicGateType, SignalValue } from '../../../types'
import SignalBadge from '../../../components/SignalBadge'
import { clsx } from 'clsx'

const GATE_SYMBOLS: Record<LogicGateType, string> = {
  BUFFER: '▷',
  NOT: '▷○',
  AND: '&',
  OR: '≥1',
  NAND: '&○',
  NOR: '≥1○',
  XOR: '=1',
  CONSTANT: '=',
  OUTPUT: 'OUT',
  INPUT: 'IN',
}

const INPUT_COUNTS: Record<LogicGateType, number> = {
  BUFFER: 1, NOT: 1, AND: 2, OR: 2,
  NAND: 2, NOR: 2, XOR: 2, CONSTANT: 0, OUTPUT: 1, INPUT: 0,
}

interface GateData {
  gateType: LogicGateType
  label: string
  inputCount?: number
  constantValue?: 0 | 1
  inputValue?: 0 | 1
  stepActive?: boolean
  stepDone?: boolean
  stepPending?: boolean
}

function getSignalClass(value: SignalValue): string {
  if (value === 1) {
    return 'bg-green-500'
  }

  if (value === 0) {
    return 'bg-red-500'
  }

  return 'bg-gray-400'
}

export default memo(function GateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as GateData
  const { gateType, label, inputCount, constantValue, inputValue, stepActive, stepDone, stepPending } = d
  const simulationState = useCircuitStore((s) => s.simulationState)
  const setNodes = useCircuitStore((s) => s.setNodes)

  const signal = simulationState[id] ?? null
  const numInputs = inputCount ?? INPUT_COUNTS[gateType] ?? 2

  const handleToggleConstant = () => {
    if (gateType !== 'CONSTANT' && gateType !== 'INPUT') {
      return
    }

    const newVal: 0 | 1 = (constantValue ?? inputValue ?? 0) === 0 ? 1 : 0

    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, constantValue: newVal, inputValue: newVal } }
          : n
      )
    )
  }

  const isToggleable = gateType === 'CONSTANT' || gateType === 'INPUT'

  return (
    <div
      className={clsx(
        'relative select-none rounded border-2 bg-white dark:bg-gray-800 shadow-sm min-w-[70px] cursor-default transition-all',
        stepActive
          ? 'border-yellow-400 ring-4 ring-yellow-300/60 dark:ring-yellow-500/40 shadow-lg scale-105'
          : stepDone
          ? 'border-green-400 dark:border-green-600'
          : stepPending
          ? 'border-gray-200 dark:border-gray-700 opacity-50'
          : selected
          ? 'border-accent-500 shadow-accent-200 dark:shadow-accent-900'
          : 'border-gray-300 dark:border-gray-600',
        isToggleable && 'cursor-pointer'
      )}
      style={{ minWidth: 70, minHeight: 50 }}
      onClick={isToggleable ? handleToggleConstant : undefined}
      role={isToggleable ? 'button' : undefined}
      aria-label={`${uk.logic.gates[gateType]}: ${label}`}
      tabIndex={isToggleable ? 0 : undefined}
      onKeyDown={
        isToggleable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleToggleConstant()
              }
            }
          : undefined
      }
    >
      {Array.from({ length: numInputs }).map((_, i) => (
        <Handle
          key={`in-${i}`}
          type="target"
          position={Position.Left}
          id={`in-${i}`}
          style={{
            top: numInputs === 1 ? '50%' : `${((i + 1) / (numInputs + 1)) * 100}%`,
            left: -8,
            width: 12,
            height: 12,
            background: '#6b7280',
            border: '2px solid #fff',
            transform: 'translateY(-50%)',
          }}
          aria-label={`Вхід ${i + 1}`}
        />
      ))}

      <div className="px-3 py-2 flex flex-col items-center gap-1">
        <div className={clsx(
          'text-sm font-bold font-mono text-center',
          gateType === 'CONSTANT' || gateType === 'INPUT'
            ? (((constantValue ?? inputValue ?? 0) === 1)
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400')
            : 'text-gray-700 dark:text-gray-200'
        )}>
          {gateType === 'CONSTANT'
            ? String(constantValue ?? 0)
            : gateType === 'INPUT'
            ? String(inputValue ?? 0)
            : GATE_SYMBOLS[gateType]}
        </div>

        <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight max-w-[60px] truncate">
          {label}
        </div>

        <SignalBadge value={signal} size="sm" />
      </div>

      {gateType !== 'OUTPUT' && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{
            top: '50%',
            right: -8,
            width: 12,
            height: 12,
            background:
              signal === 1 ? '#22c55e' : signal === 0 ? '#ef4444' : '#6b7280',
            border: '2px solid #fff',
            transform: 'translateY(-50%)',
          }}
          aria-label="Вихід"
        />
      )}
    </div>
  )
})
