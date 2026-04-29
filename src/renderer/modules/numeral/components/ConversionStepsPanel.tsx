import React, { useState } from 'react'
import { uk } from '../../../i18n/uk'
import type { ConversionStep, Base } from '../../../types'
import { ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

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
            className="btn-ghost text-xs"
            onClick={() => onSetIndex(isStepMode ? -1 : 0)}
            aria-label={isStepMode ? uk.numeral.showAll : 'Крок за кроком'}
          >
            {isStepMode ? uk.numeral.showAll : 'Крок за кроком'}
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
                <th>Операція</th>
                <th>Значення</th>
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
          <table className="table-base text-xs">
            <thead>
              <tr>
                <th>Тетрада BIN</th>
                <th>HEX</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.map((s) => (
                <tr key={s.stepNumber}>
                  <td className="font-mono font-bold text-accent-600 dark:text-accent-400">
                    {s.highlight?.[0] ?? s.operation.split(' → ')[0]}
                  </td>
                  <td className="font-mono">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
