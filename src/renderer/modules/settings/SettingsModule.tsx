import React from 'react'
import { uk } from '../../i18n/uk'
import { useAppStore } from '../../store/appStore'
import { useNumeralStore } from '../../store/numeralStore'
import { useEffect } from 'react'
import { Sun, Moon, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'

export default function SettingsModule() {
  const { theme, fontSize, setTheme, setFontSize, setActiveModule } = useAppStore()
  const { fractionDigits, setFractionDigits } = useNumeralStore()

  useEffect(() => {
    setActiveModule('/settings')
  }, [setActiveModule])

  const handleReset = () => {
    setTheme('light')
    setFontSize(14)
    setFractionDigits(8)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 gap-6 max-w-xl">
      <h2 className="section-title text-lg">{uk.settings.title}</h2>

      <div className="card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{uk.settings.theme}</h3>
        <div className="flex gap-3">
          <button
            className={clsx(
              'btn flex-1 gap-2 border-2',
              theme === 'light'
                ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                : 'btn-secondary'
            )}
            onClick={() => setTheme('light')}
            aria-label={uk.settings.light}
            aria-pressed={theme === 'light'}
          >
            <Sun className="w-4 h-4" />
            {uk.settings.light}
          </button>
          <button
            className={clsx(
              'btn flex-1 gap-2 border-2',
              theme === 'dark'
                ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                : 'btn-secondary'
            )}
            onClick={() => setTheme('dark')}
            aria-label={uk.settings.dark}
            aria-pressed={theme === 'dark'}
          >
            <Moon className="w-4 h-4" />
            {uk.settings.dark}
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {uk.settings.fontSize}: <span className="text-accent-600 dark:text-accent-400">{fontSize}px</span>
        </h3>
        <input
          type="range"
          min={12}
          max={20}
          step={1}
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full accent-accent-500"
          aria-label={uk.settings.fontSize}
          aria-valuemin={12}
          aria-valuemax={20}
          aria-valuenow={fontSize}
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>12px</span>
          <span>16px</span>
          <span>20px</span>
        </div>
        <div
          className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
          style={{ fontSize }}
        >
          Приклад тексту інтерфейсу — {fontSize}px
        </div>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {uk.settings.fractionDigits}: <span className="text-accent-600 dark:text-accent-400">{fractionDigits}</span>
        </h3>
        <input
          type="range"
          min={1}
          max={32}
          step={1}
          value={fractionDigits}
          onChange={(e) => setFractionDigits(parseInt(e.target.value))}
          className="w-full accent-accent-500"
          aria-label={uk.settings.fractionDigits}
          aria-valuemin={1}
          aria-valuemax={32}
          aria-valuenow={fractionDigits}
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>1</span>
          <span>16</span>
          <span>32</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Максимальна кількість розрядів при переведенні дробової частини числа.
        </p>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{uk.settings.language}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇺🇦</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{uk.settings.ukrainian}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(єдина мова)</span>
        </div>
      </div>

      <button
        className="btn-secondary self-start"
        onClick={handleReset}
        aria-label={uk.settings.reset}
      >
        <RotateCcw className="w-4 h-4" />
        {uk.settings.reset}
      </button>
    </div>
  )
}
