import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Hash,
  Cpu,
  BrainCircuit,
  BookOpen,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { uk } from '../i18n/uk'
import { useAppStore } from '../store/appStore'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { to: '/numeral', label: uk.nav.numeral, icon: Hash },
  { to: '/logic',   label: uk.nav.logic,   icon: Cpu },
  { to: '/boolean', label: uk.nav.boolean, icon: BrainCircuit },
  { to: '/reference', label: uk.nav.reference, icon: BookOpen },
  { to: '/settings',  label: uk.nav.settings,  icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { theme, setTheme } = useAppStore()

  const currentModule = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <aside
        className="flex flex-col w-56 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
        aria-label="Навігаційне меню"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-accent-500 text-sm leading-none">СЛЕСЧ</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                Симулятор
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5" role="navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="btn-ghost w-full justify-start gap-3 px-2"
            aria-label={theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span className="text-sm">
              {theme === 'light' ? uk.settings.dark : uk.settings.light}
            </span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center px-4 h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <h1 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {currentModule?.label ?? uk.app.fullTitle}
          </h1>
        </header>

        <main className="flex-1 overflow-hidden" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}
