import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { uk } from '../../i18n/uk'
import { useBooleanStore } from '../../store/booleanStore'
import { useAppStore } from '../../store/appStore'
import {
  parseExpression,
  buildTruthTable,
  buildDnf,
  buildCnf,
  simplifyExpression,
  evalAST,
  extractVariables,
} from './utils/parser'
import { buildKarnaughMap } from './utils/karnaugh'
import KarnaughMapComponent from './components/KarnaughMapComponent'
import TruthTablePanel from '../logic/components/TruthTablePanel'
import { Play, RefreshCw, CheckCircle, XCircle, GitBranch } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect } from 'react'

const OPERATORS = ['&', '|', '!', '^', '(', ')']

export default function BooleanModule() {
  const {
    expression, expression2,
    variables, truthTable, karnaughCells, karnaughGroups,
    simplifiedExpr, dnf, cnf, simplificationSteps, error, identityResult,
    setExpression, setExpression2, setResult, setError, setIdentityResult,
  } = useBooleanStore()

  const { setActiveModule } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => { setActiveModule('/boolean') }, [setActiveModule])

  const [karnaughMap, setKarnaughMap] = React.useState<ReturnType<typeof buildKarnaughMap> | null>(null)
  const [activeTab, setActiveTab] = useState<'table' | 'karnaugh' | 'simplify' | 'identity'>('table')

  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) {
      setError(uk.boolean.errors.empty)
      return
    }
    try {
      const { table, variables: vars } = buildTruthTable(expression)
      const dDnf = buildDnf(table, vars)
      const dCnf = buildCnf(table, vars)
      const { simplified, steps } = simplifyExpression(expression)

      const kMap = vars.length >= 2 && vars.length <= 4
        ? buildKarnaughMap(table, vars)
        : null
      setKarnaughMap(kMap)

      setResult({
        variables: vars,
        truthTable: table,
        karnaughCells: kMap?.cells ?? [],
        karnaughGroups: kMap?.groups ?? [],
        simplifiedExpr: simplified,
        dnf: dDnf,
        cnf: dCnf,
        simplificationSteps: steps,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [expression, setResult, setError])

  const handleCheckIdentity = useCallback(() => {
    if (!expression.trim() || !expression2.trim()) return
    try {
      const ast1 = parseExpression(expression)
      const ast2 = parseExpression(expression2)
      const vars1 = extractVariables(ast1)
      const vars2 = extractVariables(ast2)
      const allVars = Array.from(new Set([...vars1, ...vars2])).sort()
      const n = allVars.length
      if (n > 20) { setError('Занадто багато змінних для перевірки тотожності'); return }
      let equal = true
      for (let combo = 0; combo < (1 << n); combo++) {
        const env: Record<string, 0|1> = {}
        for (let i = 0; i < n; i++) {
          env[allVars[i]] = ((combo >> (n - 1 - i)) & 1) as 0 | 1
        }
        if (evalAST(ast1, env) !== evalAST(ast2, env)) { equal = false; break }
      }
      setIdentityResult(equal)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [expression, expression2, setIdentityResult, setError])

  const handleToCircuit = () => {
    navigate('/logic')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEvaluate()
  }

  const tabs = [
    { key: 'table',    label: uk.boolean.truthTable },
    { key: 'karnaugh', label: uk.boolean.karnaugh },
    { key: 'simplify', label: uk.boolean.simplified },
    { key: 'identity', label: uk.boolean.identity },
  ] as const

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 min-w-0">
        <div className="card p-4 flex flex-col gap-4">
          <h2 className="section-title">{uk.boolean.title}</h2>

          <div>
            <label className="label" htmlFor="bool-expr">{uk.boolean.expression}</label>
            <div className="flex gap-2">
              <input
                id="bool-expr"
                className={clsx('input font-mono flex-1', error && 'border-red-500')}
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={uk.boolean.expressionPlaceholder}
                aria-label={uk.boolean.expression}
                aria-describedby={error ? 'bool-error' : undefined}
                spellCheck={false}
              />
              <button
                className="btn-primary"
                onClick={handleEvaluate}
                aria-label={uk.boolean.evaluate}
              >
                <Play className="w-4 h-4" />
                {uk.boolean.evaluate}
              </button>
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center">{uk.boolean.operators}:</span>
            {OPERATORS.map((op) => (
              <button
                key={op}
                className="btn-secondary text-xs font-mono px-2 py-1 h-7"
                onClick={() => setExpression(expression + op)}
                aria-label={`Додати оператор ${op}`}
              >
                {op}
              </button>
            ))}
            <button
              className="btn-ghost text-xs"
              onClick={() => { setExpression(''); setError(null) }}
              aria-label={uk.common.clear}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {uk.common.clear}
            </button>
          </div>

          {error && (
            <div id="bool-error" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded" role="alert">
              {error}
            </div>
          )}

          {dnf && (
            <div className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">{uk.boolean.dnf}: </span><span className="font-mono break-all">{dnf}</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">{uk.boolean.cnf}: </span><span className="font-mono break-all">{cnf}</span></div>
              {simplifiedExpr && simplifiedExpr !== expression && (
                <div><span className="font-medium text-gray-600 dark:text-gray-400">{uk.boolean.simplified}: </span><span className="font-mono break-all">{simplifiedExpr}</span></div>
              )}
            </div>
          )}

          {dnf && (
            <button
              className="btn-secondary text-xs self-start"
              onClick={handleToCircuit}
              aria-label={uk.boolean.toCircuit}
            >
              <GitBranch className="w-4 h-4" />
              {uk.boolean.toCircuit}
            </button>
          )}
        </div>

        {truthTable.length > 0 && (
          <div className="card flex flex-col overflow-hidden flex-1">
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-2">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  className={clsx(
                    'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                    activeTab === key
                      ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                  onClick={() => setActiveTab(key)}
                  aria-selected={activeTab === key}
                  role="tab"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {activeTab === 'table' && (
                <TruthTablePanel
                  table={truthTable}
                  variables={variables}
                  expression={expression}
                  dnf={dnf}
                  cnf={cnf}
                />
              )}

              {activeTab === 'karnaugh' && (
                karnaughMap
                  ? <KarnaughMapComponent karnaughMap={karnaughMap} />
                  : <div className="text-xs text-gray-400 dark:text-gray-500">Потрібно 2–4 змінні</div>
              )}

              {activeTab === 'simplify' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{uk.boolean.simplified}:</div>
                    <div className="font-mono text-sm bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">{simplifiedExpr || expression}</div>
                  </div>
                  {simplificationSteps.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{uk.boolean.steps}:</div>
                      <ol className="space-y-1">
                        {simplificationSteps.map((step, i) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-accent-500 font-medium min-w-[1.25rem]">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {simplificationSteps.length === 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">Спрощень не виявлено</div>
                  )}
                </div>
              )}

              {activeTab === 'identity' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label text-xs" htmlFor="expr2">{uk.boolean.expr2}</label>
                    <div className="flex gap-2">
                      <input
                        id="expr2"
                        className="input font-mono flex-1 text-sm"
                        value={expression2}
                        onChange={(e) => setExpression2(e.target.value)}
                        placeholder="Введіть другий вираз"
                        spellCheck={false}
                      />
                      <button
                        className="btn-primary text-xs"
                        onClick={handleCheckIdentity}
                        aria-label={uk.boolean.check}
                      >
                        {uk.boolean.check}
                      </button>
                    </div>
                  </div>

                  {identityResult !== null && (
                    <div className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm font-medium',
                      identityResult
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    )}>
                      {identityResult
                        ? <><CheckCircle className="w-4 h-4" />{uk.boolean.areEqual}</>
                        : <><XCircle className="w-4 h-4" />{uk.boolean.areNotEqual}</>
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
