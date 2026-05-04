import React, { useCallback, useEffect, useRef } from 'react'
import { uk } from '../../i18n/uk'
import { useNumeralStore } from '../../store/numeralStore'
import { useAppStore } from '../../store/appStore'
import { convert, validateInput, getBitConcepts } from '../../utils/conversion'
import type { Base } from '../../types'
import ConversionStepsPanel from './components/ConversionStepsPanel'
import ReferenceTablePanel from './components/ReferenceTablePanel'
import BitConceptsPanel from './components/BitConceptsPanel'
import HexPowersTable from './components/HexPowersTable'
import { Copy, Trash2, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

const BASE_OPTIONS: { value: Base; label: string }[] = [
  { value: 10, label: uk.numeral.dec },
  { value: 2, label: uk.numeral.bin },
  { value: 16, label: uk.numeral.hex },
]

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>

  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

function getUsedHexPowers(
  result: string,
  input: string,
  inputBase: Base,
  outputBase: Base
): number[] {
  const hexStr = inputBase === 16 ? input : outputBase === 16 ? result : ''

  if (!hexStr) {
    return []
  }

  const intPart = hexStr.replace('(…)', '').split('.')[0].replace(/^0+/, '') || '0'
  const len = intPart === '0' ? 1 : intPart.length
  const out: number[] = []

  for (let i = 0; i < len; i++) {
    out.push(i)
  }

  return out
}

export default function NumeralModule() {
  const {
    inputValue, inputBase, outputBase, steps, result, fractionDigits,
    error, isInfinite, currentStepIndex,
    setInputValue, setInputBase, setOutputBase, setConversionResult,
    setError, setFractionDigits, setCurrentStepIndex, clear,
  } = useNumeralStore()

  const { setActiveModule } = useAppStore()

  useEffect(() => {
    setActiveModule('/numeral')
  }, [setActiveModule])

  const [copied, setCopied] = React.useState(false)
  const [fracDigitsInput, setFracDigitsInput] = React.useState(String(fractionDigits))

  const handleFracDigitsChange = (raw: string) => {
    setFracDigitsInput(raw)
    const parsed = parseInt(raw)

    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 32) {
      setFractionDigits(parsed)
    }
  }

  const commitFracDigits = () => {
    const parsed = parseInt(fracDigitsInput)

    if (!Number.isFinite(parsed)) {
      setFracDigitsInput(String(fractionDigits))
      return
    }

    const clamped = Math.max(1, Math.min(32, parsed))
    setFractionDigits(clamped)
    setFracDigitsInput(String(clamped))
  }

  const runConversion = useCallback(
    (value: string, fromBase: Base, toBase: Base, digits: number) => {
      if (!value.trim()) {
        setError(null)
        return
      }

      const err = validateInput(value, fromBase)

      if (err) {
        setError(err)
        return
      }

      const res = convert(value, fromBase, toBase, digits)
      setConversionResult(res.result, res.steps, res.isInfinite)
    },
    [setConversionResult, setError]
  )

  const debouncedConvert = useRef(
    debounce((v: unknown, f: unknown, t: unknown, d: unknown) =>
      runConversion(v as string, f as Base, t as Base, d as number), 300)
  ).current

  useEffect(() => {
    debouncedConvert(inputValue, inputBase, outputBase, fractionDigits)
  }, [inputValue, inputBase, outputBase, fractionDigits, debouncedConvert])

  const handleCopy = async () => {
    if (!result) {
      return
    }

    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard(result)
    } else {
      navigator.clipboard.writeText(result).catch(() => {
      })
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const baseLabel = (base: Base) =>
    base === 10 ? uk.numeral.decShort : base === 2 ? uk.numeral.binShort : uk.numeral.hexShort

  let bitConcepts = null

  if (result && !error) {
    const binForConcepts =
      outputBase === 2 ? result :
      inputBase === 2 ? inputValue : null

    if (binForConcepts) {
      bitConcepts = getBitConcepts(binForConcepts.replace(/\s/g, ''))
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin p-4 gap-4 min-w-0">
        <div className="card p-4 flex flex-col gap-4">
          <h2 className="section-title">{uk.numeral.title}</h2>

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="label" htmlFor="numeral-input">{uk.numeral.inputLabel}</label>
              <input
                id="numeral-input"
                className={clsx('input font-mono', error && 'border-red-500 focus:ring-red-400')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Напр.: 137"
                aria-label={uk.numeral.inputLabel}
                aria-invalid={!!error}
                aria-describedby={error ? 'numeral-error' : undefined}
                spellCheck={false}
              />
            </div>

            <div className="w-52">
              <label className="label" htmlFor="input-base">{uk.numeral.inputBase}</label>
              <select
                id="input-base"
                className="input"
                value={inputBase}
                onChange={(e) => {
                  const b = parseInt(e.target.value) as Base

                  if (b === outputBase) {
                    const other = BASE_OPTIONS.find((o) => o.value !== b)

                    if (other) {
                      setOutputBase(other.value)
                    }
                  }

                  setInputBase(b)
                }}
                aria-label={uk.numeral.inputBase}
              >
                {BASE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="w-52">
              <label className="label" htmlFor="output-base">{uk.numeral.outputBase}</label>
              <select
                id="output-base"
                className="input"
                value={outputBase}
                onChange={(e) => setOutputBase(parseInt(e.target.value) as Base)}
                aria-label={uk.numeral.outputBase}
              >
                {BASE_OPTIONS.filter((o) => o.value !== inputBase).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <label className="label" htmlFor="frac-digits">{uk.numeral.fractionDigits}</label>
              <input
                id="frac-digits"
                type="number"
                min={1}
                max={32}
                className="input"
                value={fracDigitsInput}
                onChange={(e) => handleFracDigitsChange(e.target.value)}
                onBlur={commitFracDigits}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur()
                  }
                }}
                aria-label={uk.numeral.fractionDigits}
              />
            </div>
          </div>

          {error && (
            <div
              id="numeral-error"
              className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded border border-red-200 dark:border-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          {result && !error && (
            <div className="flex items-center gap-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
              <div className="flex-1">
                <div className="text-xs text-accent-600 dark:text-accent-400 font-medium mb-1">
                  {baseLabel(inputBase)} → {baseLabel(outputBase)}
                </div>
                <div className="font-mono text-lg font-bold text-accent-700 dark:text-accent-300 break-all">
                  {result}
                </div>
                {isInfinite && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    ⚠ {uk.numeral.infiniteWarning}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs"
                  onClick={handleCopy}
                  aria-label={uk.numeral.copy}
                  title={uk.numeral.copy}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? uk.numeral.copied : uk.numeral.copy}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="btn-secondary text-xs"
              onClick={clear}
              aria-label={uk.numeral.clear}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {uk.numeral.clear}
            </button>
          </div>
        </div>

        {steps.length > 0 && (
          <ConversionStepsPanel
            steps={steps}
            currentIndex={currentStepIndex}
            onSetIndex={setCurrentStepIndex}
            fromBase={inputBase}
            toBase={outputBase}
          />
        )}

        {bitConcepts && <BitConceptsPanel concepts={bitConcepts} binValue={result} />}

        {(inputBase === 16 || outputBase === 16) && (
          <HexPowersTable usedInConversion={getUsedHexPowers(result, inputValue, inputBase, outputBase)} />
        )}
      </div>

      <div className="w-64 border-l border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto scrollbar-thin p-3 bg-white dark:bg-gray-800">
        <ReferenceTablePanel />
      </div>
    </div>
  )
}
