import React, { useMemo } from 'react'
import { uk } from '../../../i18n/uk'
import type { TruthTableRow } from '../../../types'
import { clsx } from 'clsx'

interface Props {
  table: TruthTableRow[]
  variables: string[]
  expression?: string
  dnf?: string
  cnf?: string
}

export default function TruthTablePanel({ table, variables, expression, dnf, cnf }: Props) {
  if (table.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {expression && (
        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm font-mono">
          <span className="text-gray-500 dark:text-gray-400 text-xs">{uk.logic.expression}: </span>
          {expression}
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="table-base text-xs">
          <thead>
            <tr>
              <th className="text-center">#</th>
              {variables.map((v) => <th key={v} className="text-center">{v}</th>)}
              <th className="text-accent-600 dark:text-accent-400 text-center">Y</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr
                key={i}
                className={clsx(row.output === 1 && 'bg-green-50 dark:bg-green-900/10')}
              >
                <td className="text-gray-400 dark:text-gray-500 font-mono text-center">{i}</td>
                {variables.map((v) => (
                  <td key={v} className="font-mono text-center">
                    <span className={row.inputs[v] === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {row.inputs[v]}
                    </span>
                  </td>
                ))}
                <td className="font-mono text-center font-bold">
                  <span className={row.output === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {row.output}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dnf && (
        <div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{uk.logic.dnf}: </span>
          <span className="text-xs font-mono break-all">{dnf}</span>
        </div>
      )}
      {cnf && (
        <div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{uk.logic.cnf}: </span>
          <span className="text-xs font-mono break-all">{cnf}</span>
        </div>
      )}
    </div>
  )
}
