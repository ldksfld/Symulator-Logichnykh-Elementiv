import React from 'react'
import { uk } from '../i18n/uk'
import type { SignalValue } from '../types'

interface Props {
  value: SignalValue
  size?: 'sm' | 'md'
}

export default function SignalBadge({ value, size = 'sm' }: Props) {
  const cls = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
  if (value === 1)
    return (
      <span
        className={`${cls} rounded font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}
        aria-label={uk.common.signal1}
      >
        1
      </span>
    )
  if (value === 0)
    return (
      <span
        className={`${cls} rounded font-mono bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}
        aria-label={uk.common.signal0}
      >
        0
      </span>
    )
  return (
    <span
      className={`${cls} rounded font-mono bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400`}
      aria-label={uk.common.signalUnknown}
    >
      ?
    </span>
  )
}
