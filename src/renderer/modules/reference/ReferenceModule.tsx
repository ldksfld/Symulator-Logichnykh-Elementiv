import React, { useState } from 'react'
import { uk } from '../../i18n/uk'
import { useAppStore } from '../../store/appStore'
import { useEffect } from 'react'
import { clsx } from 'clsx'

const CONVERSION_TABLE = Array.from({ length: 16 }, (_, i) => ({
  dec: i,
  bin: i.toString(2).padStart(4, '0'),
  hex: i.toString(16).toUpperCase(),
}))

const BOOLEAN_LAWS = [
  { name: 'Комутативний закон (І)', formula: 'A · B = B · A' },
  { name: 'Комутативний закон (АБО)', formula: 'A + B = B + A' },
  { name: 'Асоціативний закон (І)', formula: '(A · B) · C = A · (B · C)' },
  { name: 'Асоціативний закон (АБО)', formula: '(A + B) + C = A + (B + C)' },
  { name: 'Дистрибутивний закон (І відн. АБО)', formula: 'A · (B + C) = A·B + A·C' },
  { name: 'Дистрибутивний закон (АБО відн. І)', formula: 'A + B·C = (A+B)·(A+C)' },
  { name: 'Закон ідемпотентності (І)', formula: 'A · A = A' },
  { name: 'Закон ідемпотентності (АБО)', formula: 'A + A = A' },
  { name: 'Закон нуля (І)', formula: 'A · 0 = 0' },
  { name: 'Закон одиниці (І)', formula: 'A · 1 = A' },
  { name: 'Закон нуля (АБО)', formula: 'A + 0 = A' },
  { name: 'Закон одиниці (АБО)', formula: 'A + 1 = 1' },
  { name: 'Закон доповнення (І)', formula: 'A · Ā = 0' },
  { name: 'Закон доповнення (АБО)', formula: 'A + Ā = 1' },
  { name: 'Закон подвійного заперечення', formula: 'Ā̄ = A' },
  { name: 'Закон де Моргана (І)', formula: '¬(A · B) = ¬A + ¬B' },
  { name: 'Закон де Моргана (АБО)', formula: '¬(A + B) = ¬A · ¬B' },
  { name: 'Закон поглинання (І)', formula: 'A · (A + B) = A' },
  { name: 'Закон поглинання (АБО)', formula: 'A + A·B = A' },
]

const GATE_TABLES: Array<{
  name: string
  symbol: string
  inputs: (0|1)[][]
  output: (0|1)[]
  formula: string
}> = [
  { name: 'Буфер', symbol: '▷', inputs: [[0],[1]], output: [0,1], formula: 'y = x' },
  { name: 'Інвертор (НЕ)', symbol: '▷○', inputs: [[0],[1]], output: [1,0], formula: 'y = x̄' },
  { name: 'Кон\'юнктор (І)', symbol: '&', inputs: [[0,0],[0,1],[1,0],[1,1]], output: [0,0,0,1], formula: 'y = x₁ · x₂' },
  { name: 'Диз\'юнктор (АБО)', symbol: '≥1', inputs: [[0,0],[0,1],[1,0],[1,1]], output: [0,1,1,1], formula: 'y = x₁ + x₂' },
  { name: 'Елемент Шеффера (І-НЕ)', symbol: '&○', inputs: [[0,0],[0,1],[1,0],[1,1]], output: [1,1,1,0], formula: 'y = ¬(x₁ · x₂)' },
  { name: 'Елемент Пірса (АБО-НЕ)', symbol: '≥1○', inputs: [[0,0],[0,1],[1,0],[1,1]], output: [1,0,0,0], formula: 'y = ¬(x₁ + x₂)' },
  { name: 'Виключне АБО (XOR)', symbol: '=1', inputs: [[0,0],[0,1],[1,0],[1,1]], output: [0,1,1,0], formula: 'y = x₁ ⊕ x₂' },
]

type Tab = 'conversion' | 'laws' | 'gates'

export default function ReferenceModule() {
  const { setActiveModule } = useAppStore()

  useEffect(() => {
    setActiveModule('/reference')
  }, [setActiveModule])

  const [activeTab, setActiveTab] = useState<Tab>('conversion')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'conversion', label: uk.reference.conversionTable },
    { key: 'laws', label: uk.reference.booleanLaws },
    { key: 'gates', label: uk.reference.logicGates },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 gap-4">
      <h2 className="section-title">{uk.reference.title}</h2>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === key
                ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
            onClick={() => setActiveTab(key)}
            role="tab"
            aria-selected={activeTab === key}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'conversion' && (
          <div className="max-w-sm">
            <table className="table-base text-sm">
              <thead>
                <tr>
                  <th>{uk.reference.dec}</th>
                  <th>BIN (4 біти)</th>
                  <th>HEX</th>
                </tr>
              </thead>
              <tbody>
                {CONVERSION_TABLE.map((row) => (
                  <tr key={row.dec}>
                    <td className="font-mono">{row.dec}</td>
                    <td className="font-mono">{row.bin}</td>
                    <td className="font-mono font-bold text-accent-600 dark:text-accent-400">{row.hex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'laws' && (
          <div className="max-w-xl">
            <table className="table-base text-sm">
              <thead>
                <tr>
                  <th>Закон</th>
                  <th>Формула</th>
                </tr>
              </thead>
              <tbody>
                {BOOLEAN_LAWS.map((law) => (
                  <tr key={law.name}>
                    <td>{law.name}</td>
                    <td className="font-mono">{law.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'gates' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GATE_TABLES.map((gate) => (
              <div key={gate.name} className="card p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-accent-600 dark:text-accent-400 w-10 text-center">{gate.symbol}</span>
                  <div>
                    <div className="font-medium text-sm">{gate.name}</div>
                    <div className="font-mono text-xs text-gray-500 dark:text-gray-400">{gate.formula}</div>
                  </div>
                </div>
                <table className="table-base text-xs">
                  <thead>
                    <tr>
                      {gate.inputs[0]?.map((_, i) => <th key={i}>x{i+1}</th>)}
                      <th>Y</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gate.inputs.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td key={j} className={`font-mono text-center ${v === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{v}</td>
                        ))}
                        <td className={`font-mono text-center font-bold ${gate.output[i] === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{gate.output[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
