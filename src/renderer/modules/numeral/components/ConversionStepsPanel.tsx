import React, { useState } from 'react'
import { uk } from '../../../i18n/uk'
import type { ConversionStep, Base } from '../../../types'
import { ChevronLeft, ChevronRight, ChevronsRight, List, Square } from 'lucide-react'

const TETRAD_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
]

interface Props {
  steps: ConversionStep[]
  currentIndex: number
  onSetIndex: (i: number) => void
  fromBase: Base
  toBase: Base
}

export default function ConversionStepsPanel({ steps, currentIndex, onSetIndex, fromBase, toBase }: Props) {
  const [showAll, setShowAll] = useState(true)

  const intSteps = steps.filter((s) => s.integerPart !== undefined || s.remainder !== undefined)
  const fracSteps = steps.filter((s) => s.mantissa !== undefined)

  const isStepMode = currentIndex >= 0
  const visibleSteps = isStepMode ? steps.slice(0, currentIndex + 1) : steps

  const isFraction = fracSteps.length > 0
  const isDivision = fromBase === 10 && (toBase === 2 || toBase === 16)
  const isExpansion = (fromBase === 2 || fromBase === 16) && toBase === 10
  const isTetrad = fromBase === 10 && toBase === 16
  const isHexBin = fromBase === 16 && toBase === 2

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">{uk.numeral.steps}</h3>
        <div className="flex gap-2">
          <button
            className="btn-secondary text-xs"
            onClick={() => onSetIndex(isStepMode ? -1 : 0)}
            aria-label={isStepMode ? uk.numeral.showAll : uk.numeral.stepByStep}
          >
            {isStepMode
              ? <><List className="w-3.5 h-3.5" />{uk.numeral.showAll}</>
              : <><Square className="w-3.5 h-3.5" />{uk.numeral.stepByStep}</>
            }
          </button>
        </div>
      </div>

      {isStepMode && (
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary text-xs"
            disabled={currentIndex <= 0}
            onClick={() => onSetIndex(currentIndex - 1)}
            aria-label={uk.numeral.prevStep}
          >
            <ChevronLeft className="w-4 h-4" />
            {uk.numeral.prevStep}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {uk.numeral.stepTitle} {currentIndex + 1} / {steps.length}
          </span>
          <button
            className="btn-secondary text-xs"
            disabled={currentIndex >= steps.length - 1}
            onClick={() => onSetIndex(currentIndex + 1)}
            aria-label={uk.numeral.nextStep}
          >
            {uk.numeral.nextStep}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isDivision && (
        <div className="overflow-x-auto scrollbar-thin">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{uk.numeral.algorithmDivision}</p>
          <table className="table-base text-xs">
            <thead>
              <tr>
                <th>{uk.numeral.number}</th>
                <th>{uk.numeral.divisor}</th>
                <th>{uk.numeral.quotient}</th>
                <th>{uk.numeral.remainder}</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.filter(s => s.remainder !== undefined).map((s) => (
                <tr key={s.stepNumber}>
                  <td className="font-mono">{s.integerPart}</td>
                  <td className="font-mono">÷ 2</td>
                  <td className="font-mono">{s.value}</td>
                  <td className="font-mono font-bold text-accent-600 dark:text-accent-400">{s.remainder}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{uk.numeral.readBottomUp}</p>
        </div>
      )}

      {isFraction && fromBase === 10 && (
        <div className="overflow-x-auto scrollbar-thin">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{uk.numeral.algorithmMultiplication} ({uk.numeral.stepFractionPart})</p>
          <table className="table-base text-xs">
            <thead>
              <tr>
                <th>{uk.numeral.number}</th>
                <th>× 2</th>
                <th>{uk.numeral.integer}</th>
                <th>{uk.numeral.fraction}</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.filter(s => s.mantissa !== undefined).map((s) => (
                <tr key={s.stepNumber}>
                  <td className="font-mono">{s.operation.split(' × ')[0]}</td>
                  <td className="font-mono">× 2</td>
                  <td className="font-mono font-bold text-accent-600 dark:text-accent-400">{s.integerPart}</td>
                  <td className="font-mono">{s.mantissa}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{uk.numeral.readIntegerPart}</p>
        </div>
      )}

      {isExpansion && (
        <div className="overflow-x-auto scrollbar-thin">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{uk.numeral.algorithmExpand}</p>
          <table className="table-base text-xs">
            <thead>
              <tr>
                <th>{uk.numeral.operation}</th>
                <th>{uk.numeral.valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.map((s) => (
                <tr key={s.stepNumber}>
                  <td className="font-mono">{s.operation}</td>
                  <td className="font-mono text-accent-600 dark:text-accent-400">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(isTetrad || isHexBin || (fromBase === 2 && toBase === 16)) && (
        <div className="overflow-x-auto scrollbar-thin">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{uk.numeral.algorithmTetrad}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic mb-2">{uk.numeral.tetradHighlight}</p>
          <table className="table-base text-xs">
            <thead>
              <tr>
                <th>Тетрада BIN</th>
                <th>HEX</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.map((s, idx) => {
                const tetrad = s.highlight?.[0] ?? s.operation.split(' → ')[0]
                const colorCls = TETRAD_COLORS[idx % TETRAD_COLORS.length]
                return (
                  <tr key={s.stepNumber}>
                    <td>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${colorCls}`}>
                        {tetrad}
                      </span>
                    </td>
                    <td>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${colorCls}`}>
                        {s.value}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
