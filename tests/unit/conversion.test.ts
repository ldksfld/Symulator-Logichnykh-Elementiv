import { describe, it, expect } from 'vitest'
import {
  decToBin,
  decToHex,
  binToDec,
  binToHex,
  hexToBin,
  hexToDec,
  validateInput,
} from '../../src/renderer/utils/conversion'

describe('decToBin', () => {
  it('converts integer 137 → 10001001', () => {
    const { result } = decToBin('137')
    expect(result).toBe('10001001')
  })

  it('converts 0 → 0', () => {
    expect(decToBin('0').result).toBe('0')
  })

  it('converts 255 → 11111111', () => {
    expect(decToBin('255').result).toBe('11111111')
  })

  it('converts 0.5 → 0.1', () => {
    const { result } = decToBin('0.5', 8)
    expect(result).toBe('0.1')
  })

  it('converts 0.703125 → 0.101101', () => {
    const { result } = decToBin('0.703125', 8)
    expect(result).toBe('0.101101')
  })

  it('marks infinite fraction for 0.05', () => {
    const { isInfinite } = decToBin('0.05', 12)
    expect(isInfinite).toBe(true)
  })

  it('produces steps for integer conversion', () => {
    const { steps } = decToBin('137')
    expect(steps.length).toBeGreaterThan(0)
    expect(steps[0].remainder).toBeDefined()
  })
})

describe('decToHex', () => {
  it('converts 137 → 89', () => {
    const { result } = decToHex('137')
    expect(result).toBe('89')
  })

  it('converts 255 → FF', () => {
    expect(decToHex('255').result).toBe('FF')
  })

  it('converts 65535 → FFFF', () => {
    expect(decToHex('65535').result).toBe('FFFF')
  })

  it('converts 13789 → 35DD', () => {
    expect(decToHex('13789').result).toBe('35DD')
  })
})

describe('binToDec', () => {
  it('converts 10001001 → 137', () => {
    const { result } = binToDec('10001001')
    expect(result).toBe('137')
  })

  it('converts 0.1 → 0.5', () => {
    const { result } = binToDec('0.1')
    expect(parseFloat(result)).toBe(0.5)
  })

  it('converts 11111111 → 255', () => {
    expect(binToDec('11111111').result).toBe('255')
  })
})

describe('binToHex', () => {
  it('converts 10001001 → 89', () => {
    const { result } = binToHex('10001001')
    expect(result).toBe('89')
  })

  it('converts 1111 → F', () => {
    expect(binToHex('1111').result).toBe('F')
  })
})

describe('hexToBin', () => {
  it('converts 89 → 10001001', () => {
    const { result } = hexToBin('89')
    expect(result).toBe('10001001')
  })

  it('converts F → 1111', () => {
    expect(hexToBin('F').result).toBe('1111')
  })
})

describe('hexToDec', () => {
  it('converts 89 → 137', () => {
    const { result } = hexToDec('89')
    expect(result).toBe('137')
  })

  it('converts FF → 255', () => {
    expect(hexToDec('FF').result).toBe('255')
  })
})

describe('validateInput', () => {
  it('accepts valid BIN', () => {
    expect(validateInput('1010', 2)).toBeNull()
  })

  it('rejects invalid BIN', () => {
    expect(validateInput('1012', 2)).not.toBeNull()
  })

  it('accepts valid HEX', () => {
    expect(validateInput('FF89', 16)).toBeNull()
  })

  it('rejects invalid HEX char G', () => {
    const err = validateInput('FFG', 16)
    expect(err).toContain('G')
  })

  it('accepts valid DEC', () => {
    expect(validateInput('12345', 10)).toBeNull()
  })

  it('rejects invalid DEC', () => {
    expect(validateInput('12A', 10)).not.toBeNull()
  })
})
