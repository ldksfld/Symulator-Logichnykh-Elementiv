import React from 'react'
import { uk } from '../../../i18n/uk'
import type { KarnaughMap } from '../utils/karnaugh'
import { getCellPosition } from '../utils/karnaugh'
import { clsx } from 'clsx'

interface Props {
  karnaughMap: KarnaughMap
}

export default function KarnaughMapComponent({ karnaughMap }: Props) {
  const { cells, groups, vars, rows, cols, rowVars, colVars, rowLabels, colLabels } = karnaughMap

  if (vars.length < 2) return null

  const grid: Array<Array<typeof cells[0]>> = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const cell = cells.find((cell) => {
        const [cr, cc] = getCellPosition(cell.minterm, vars)
        return cr === r && cc === c
      })
      return cell!
    })
  )

  const getCellColors = (cell: typeof cells[0]) => {
    if (!cell || cell.groupIds.length === 0) return []
    return cell.groupIds
      .map((gid) => groups.find((g) => g.id === gid)?.color)
      .filter(Boolean) as string[]
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="section-title">{uk.boolean.karnaugh}</h3>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm font-mono">
          <thead>
            <tr>
              <th className="p-2 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                {rowVars.join('')} \ {colVars.join('')}
              </th>
              {colLabels.map((label, i) => (
                <th
                  key={i}
                  className="p-2 text-xs text-accent-600 dark:text-accent-400 border border-gray-200 dark:border-gray-600 w-12 h-10"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="p-2 text-xs text-accent-600 dark:text-accent-400 border border-gray-200 dark:border-gray-600 font-medium">
                  {rowLabels[rowIdx]}
                </td>
                {row.map((cell, colIdx) => {
                  if (!cell) return <td key={colIdx} className="border p-2 w-12 h-10" />
                  const colors = getCellColors(cell)
                  const hasGroup = colors.length > 0

                  return (
                    <td
                      key={colIdx}
                      className={clsx(
                        'border border-gray-300 dark:border-gray-600 text-center w-12 h-10 font-bold transition-colors',
                        cell.value === 1
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      )}
                      style={hasGroup ? { backgroundColor: colors[0] } : undefined}
                      title={`Мінтерм ${cell.minterm}`}
                    >
                      {cell.value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {groups.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{uk.boolean.karnaughGroups}:</div>
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                style={{ backgroundColor: g.color }}
              />
              <span className="font-mono">{g.expression}</span>
              <span className="text-gray-400">(мінтерми: {g.cells.join(', ')})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
