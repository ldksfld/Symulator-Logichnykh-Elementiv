import React from 'react'
import { uk } from '../../../i18n/uk'
import { clsx } from 'clsx'

interface Props {
  usedInConversion: number[]
}

const POWERS = Array.from({ length: 9 }, (_, i) => ({
  power: i,
  value: Math.pow(16, i),
  hex: (Math.pow(16, i)).toString(16).toUpperCase(),
}))

export default function HexPowersTable({ usedInConversion }: Props) {
  return (
    <div className="card p-4">
      <h3 className="section-title">{uk.numeral.hexPowersTable}</h3>
      <table className="table-base text-xs">
        <thead>
          <tr>
            <th>16^n</th>
            <th>DEC</th>
            <th>HEX</th>
          </tr>
        </thead>
        <tbody>
          {POWERS.map((row) => {
            const used = usedInConversion.includes(row.power)

            return (
              <tr
                key={row.power}
                className={clsx(
                  used &&
                    'bg-amber-100 dark:bg-amber-900/40 font-bold ring-1 ring-inset ring-amber-400 dark:ring-amber-500'
                )}
              >
                <td className={clsx('font-mono', used && 'text-amber-800 dark:text-amber-200')}>
                  {used && <span className="mr-1">★</span>}16^{row.power}
                </td>
                <td className={clsx('font-mono', used && 'text-amber-800 dark:text-amber-200')}>
                  {row.value.toLocaleString()}
                </td>
                <td className={clsx('font-mono', used && 'text-amber-800 dark:text-amber-200')}>
                  {row.hex}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
