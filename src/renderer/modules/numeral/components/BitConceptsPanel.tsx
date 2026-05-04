import React from 'react'
import { uk } from '../../../i18n/uk'

interface Concepts {
  bit: number
  nibble: number
  byte: number
  word: number
  dword: number
}

interface Props {
  concepts: Concepts
  binValue: string
}

export default function BitConceptsPanel({ concepts, binValue }: Props) {
  const rows = [
    { label: uk.numeral.bit, value: concepts.bit, desc: '1 двійковий розряд' },
    { label: uk.numeral.nibble, value: concepts.nibble, desc: '4 біти = 1 HEX-цифра (тетрада)' },
    { label: uk.numeral.byte, value: concepts.byte, desc: '8 бітів' },
    { label: uk.numeral.word, value: concepts.word, desc: '16 бітів' },
    { label: uk.numeral.dword, value: concepts.dword, desc: '32 біти' },
  ]

  return (
    <div className="card p-4">
      <h3 className="section-title">{uk.numeral.bitConcepts}</h3>
      <table className="table-base text-xs">
        <thead>
          <tr>
            <th>Поняття</th>
            <th>Бітів</th>
            <th>Опис</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="font-medium">{r.label}</td>
              <td className="font-mono">{r.value}</td>
              <td className="text-gray-500 dark:text-gray-400">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
