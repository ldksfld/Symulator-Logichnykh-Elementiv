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
          {POWERS.map((row) => (
            <tr
              key={row.power}
              className={clsx(
                usedInConversion.includes(row.power) &&
                  'bg-accent-50 dark:bg-accent-900/20 font-medium'
              )}
            >
              <td className="font-mono">16^{row.power}</td>
              <td className="font-mono">{row.value.toLocaleString()}</td>
              <td className="font-mono">{row.hex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
