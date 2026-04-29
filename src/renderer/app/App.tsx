import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import ErrorBoundary from '../components/ErrorBoundary'
import { useAppStore } from '../store/appStore'
import { uk } from '../i18n/uk'

const NumeralModule = lazy(() => import('../modules/numeral/NumeralModule'))
const LogicModule = lazy(() => import('../modules/logic/LogicModule'))
const BooleanModule = lazy(() => import('../modules/boolean/BooleanModule'))
const ReferenceModule = lazy(() => import('../modules/reference/ReferenceModule'))
const SettingsModule = lazy(() => import('../modules/settings/SettingsModule'))

function ModuleLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          {uk.common.loading}
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  const { theme, fontSize } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.setProperty('--font-size-base', `${fontSize}px`)
  }, [theme, fontSize])

  return (
    <div className="dark:bg-gray-900 h-screen flex flex-col overflow-hidden">
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/numeral" replace />} />
          <Route
            path="/numeral"
            element={
              <ErrorBoundary>
                <ModuleLoader>
                  <NumeralModule />
                </ModuleLoader>
              </ErrorBoundary>
            }
          />
          <Route
            path="/logic"
            element={
              <ErrorBoundary>
                <ModuleLoader>
                  <LogicModule />
                </ModuleLoader>
              </ErrorBoundary>
            }
          />
          <Route
            path="/boolean"
            element={
              <ErrorBoundary>
                <ModuleLoader>
                  <BooleanModule />
                </ModuleLoader>
              </ErrorBoundary>
            }
          />
          <Route
            path="/reference"
            element={
              <ErrorBoundary>
                <ModuleLoader>
                  <ReferenceModule />
                </ModuleLoader>
              </ErrorBoundary>
            }
          />
          <Route
            path="/settings"
            element={
              <ErrorBoundary>
                <ModuleLoader>
                  <SettingsModule />
                </ModuleLoader>
              </ErrorBoundary>
            }
          />
        </Routes>
      </Layout>
    </div>
  )
}
