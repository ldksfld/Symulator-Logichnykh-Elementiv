import type { ConversionStep, Base } from '../types'

export interface ConversionResult {
  result: string
  steps: ConversionStep[]
  isInfinite: boolean
}

export function validateInput(value: string, base: Base): string | null {
  if (!value || value === '.' || value === ',') return 'Введіть число для конвертації'
  const normalized = value.replace(',', '.')
  const [intPart, fracPart] = normalized.split('.')
  if (fracPart !== undefined && fracPart === '') return null

  if (base === 2) {
    if (!/^[01]*\.?[01]*$/.test(normalized)) {
      const bad = normalized.replace(/[.]/g, '').split('').find((c) => c !== '0' && c !== '1')
      return bad ? `Символ "${bad}" не є допустимим для двійкової системи` : 'Допустимі символи для двійкової: 0 та 1'
    }
  } else if (base === 16) {
    if (!/^[0-9a-fA-F]*\.?[0-9a-fA-F]*$/.test(normalized)) {
      const bad = normalized.replace(/[.]/g, '').split('').find((c) => !/[0-9a-fA-F]/i.test(c))
      return bad ? `Символ "${bad.toUpperCase()}" не є допустимим для шістнадцяткової системи числення` : 'Недопустимі символи'
    }
  } else {
    if (!/^\d*\.?\d*$/.test(normalized)) {
      const bad = normalized.replace(/[.]/g, '').split('').find((c) => !/\d/.test(c))
      return bad ? `Символ "${bad}" не є допустимим для десяткової системи` : 'Допустимі символи для десяткової: цифри 0–9'
    }
  }
  return null
}

export function decToBin(value: string, maxFracDigits = 8): ConversionResult {
  const normalized = value.replace(',', '.')
  const [intStr, fracStr] = normalized.split('.')

  const intVal = BigInt(intStr || '0')
  const steps: ConversionStep[] = []
  let intBin: string

  if (intVal === 0n) {
    intBin = '0'
    steps.push({
      stepNumber: 1,
      operation: '0 ÷ 2',
      value: '0',
      remainder: '0',
      integerPart: '0',
    })
  } else {
    let n = intVal
    const remainders: string[] = []
    let stepNum = 1
    while (n > 0n) {
      const rem = n % 2n
      steps.push({
        stepNumber: stepNum++,
        operation: `${n} ÷ 2`,
        value: String(n / 2n),
        remainder: String(rem),
        integerPart: String(n),
      })
      remainders.push(String(rem))
      n = n / 2n
    }
    intBin = remainders.reverse().join('')
  }

  if (!fracStr) return { result: intBin, steps, isInfinite: false }

  let frac = parseFloat('0.' + fracStr)
  const fracBits: string[] = []
  let isInfinite = false
  const normKey = (v: number) => Math.round(v * 1e12).toString()
  const seen = new Map<string, number>()
  let fracStepNum = steps.length + 1

  for (let i = 0; i < maxFracDigits; i++) {
    const key = normKey(frac)
    if (seen.has(key)) {
      isInfinite = true
      break
    }
    seen.set(key, i)

    frac *= 2
    const bit = frac >= 1 ? 1 : 0
    const mantissa = frac >= 1 ? frac - 1 : frac
    steps.push({
      stepNumber: fracStepNum++,
      operation: `${(frac / 2).toFixed(10).replace(/0+$/, '')} × 2`,
      value: String(bit),
      integerPart: String(bit),
      mantissa: mantissa.toFixed(10).replace(/0+$/, '').replace(/\.$/, '.0'),
    })
    fracBits.push(String(bit))
    frac = mantissa
    if (frac === 0) break
  }

  const fracBin = fracBits.join('')
  let result = intBin + (fracBin ? '.' + fracBin : '')
  if (isInfinite) result += '(…)'

  return { result, steps, isInfinite }
}

export function decToHex(value: string, maxFracDigits = 8): ConversionResult {
  const normalized = value.replace(',', '.')
  const [intStr, fracStr] = normalized.split('.')

  const intVal = BigInt(intStr || '0')
  const steps: ConversionStep[] = []
  let intHex: string

  if (intVal === 0n) {
    intHex = '0'
    steps.push({ stepNumber: 1, operation: '0 → BIN → HEX', value: '0', integerPart: '0' })
  } else {
    const binResult = decToBin(intStr, 0)
    const paddedBin = binResult.result.padStart(Math.ceil(binResult.result.length / 4) * 4, '0')
    const tetrads: string[] = []
    for (let i = 0; i < paddedBin.length; i += 4) {
      tetrads.push(paddedBin.slice(i, i + 4))
    }
    tetrads.forEach((t, idx) => {
      const hexChar = parseInt(t, 2).toString(16).toUpperCase()
      steps.push({
        stepNumber: idx + 1,
        operation: `Тетрада ${t}`,
        value: hexChar,
        highlight: [t],
      })
    })
    intHex = tetrads.map((t) => parseInt(t, 2).toString(16).toUpperCase()).join('')
  }

  if (!fracStr) return { result: intHex, steps, isInfinite: false }

  const fracBinResult = decToBin('0.' + fracStr, maxFracDigits)
  const fracBin = fracBinResult.result.startsWith('0.')
    ? fracBinResult.result.slice(2).replace('(…)', '')
    : ''
  const paddedFracBin = fracBin.padEnd(Math.ceil(fracBin.length / 4) * 4, '0')
  const fracTetrads: string[] = []
  for (let i = 0; i < paddedFracBin.length; i += 4) {
    fracTetrads.push(paddedFracBin.slice(i, i + 4))
  }
  const fracHex = fracTetrads.map((t) => parseInt(t, 2).toString(16).toUpperCase()).join('')
  const result = intHex + (fracHex ? '.' + fracHex : '') + (fracBinResult.isInfinite ? '(…)' : '')

  return { result, steps, isInfinite: fracBinResult.isInfinite }
}

export function binToDec(value: string): ConversionResult {
  const normalized = value.replace(',', '.')
  const [intStr, fracStr] = normalized.split('.')
  const steps: ConversionStep[] = []
  let total = 0

  let stepNum = 1
  for (let i = 0; i < intStr.length; i++) {
    const bit = parseInt(intStr[i])
    const power = intStr.length - 1 - i
    const contribution = bit * Math.pow(2, power)
    steps.push({
      stepNumber: stepNum++,
      operation: `${bit} × 2^${power}`,
      value: String(contribution),
    })
    total += contribution
  }

  let fracTotal = 0
  if (fracStr) {
    for (let i = 0; i < fracStr.length; i++) {
      const bit = parseInt(fracStr[i])
      const power = -(i + 1)
      const contribution = bit * Math.pow(2, power)
      steps.push({
        stepNumber: stepNum++,
        operation: `${bit} × 2^${power}`,
        value: String(contribution),
      })
      fracTotal += contribution
    }
  }

  const result = (total + fracTotal).toString()
  return { result, steps, isInfinite: false }
}

export function binToHex(value: string): ConversionResult {
  const normalized = value.replace(',', '.')
  const [intStr, fracStr] = normalized.split('.')
  const steps: ConversionStep[] = []

  const paddedInt = intStr.padStart(Math.ceil(intStr.length / 4) * 4, '0')
  const intTetrads: string[] = []
  for (let i = 0; i < paddedInt.length; i += 4) {
    intTetrads.push(paddedInt.slice(i, i + 4))
  }

  let stepNum = 1
  const intHexChars = intTetrads.map((t) => {
    const h = parseInt(t, 2).toString(16).toUpperCase()
    steps.push({
      stepNumber: stepNum++,
      operation: `${t} → ${h}`,
      value: h,
      highlight: [t],
    })
    return h
  })
  const intHex = intHexChars.join('')

  if (!fracStr) return { result: intHex, steps, isInfinite: false }

  const paddedFrac = fracStr.padEnd(Math.ceil(fracStr.length / 4) * 4, '0')
  const fracTetrads: string[] = []
  for (let i = 0; i < paddedFrac.length; i += 4) {
    fracTetrads.push(paddedFrac.slice(i, i + 4))
  }
  const fracHexChars = fracTetrads.map((t) => {
    const h = parseInt(t, 2).toString(16).toUpperCase()
    steps.push({
      stepNumber: stepNum++,
      operation: `${t} → ${h}`,
      value: h,
      highlight: [t],
    })
    return h
  })

  return {
    result: intHex + '.' + fracHexChars.join(''),
    steps,
    isInfinite: false,
  }
}

export function hexToBin(value: string): ConversionResult {
  const normalized = value.replace(',', '.').toUpperCase()
  const [intStr, fracStr] = normalized.split('.')
  const steps: ConversionStep[] = []
  let stepNum = 1

  const intBinChars = intStr.split('').map((ch) => {
    const bin = parseInt(ch, 16).toString(2).padStart(4, '0')
    steps.push({
      stepNumber: stepNum++,
      operation: `${ch} → ${bin}`,
      value: bin,
    })
    return bin
  })
  const intBin = intBinChars.join('')

  if (!fracStr) return { result: intBin, steps, isInfinite: false }

  const fracBinChars = fracStr.split('').map((ch) => {
    const bin = parseInt(ch, 16).toString(2).padStart(4, '0')
    steps.push({
      stepNumber: stepNum++,
      operation: `${ch} → ${bin}`,
      value: bin,
    })
    return bin
  })

  return {
    result: intBin + '.' + fracBinChars.join(''),
    steps,
    isInfinite: false,
  }
}

export function hexToDec(value: string): ConversionResult {
  const normalized = value.replace(',', '.').toUpperCase()
  const binResult = hexToBin(normalized)
  const binVal = binResult.result
  const decResult = binToDec(binVal)
  const steps: ConversionStep[] = [
    ...binResult.steps.map((s) => ({ ...s, operation: `HEX→BIN: ${s.operation}` })),
    ...decResult.steps.map((s, i) => ({
      ...s,
      stepNumber: binResult.steps.length + i + 1,
      operation: `BIN→DEC: ${s.operation}`,
    })),
  ]
  return { result: decResult.result, steps, isInfinite: false }
}

export function convert(
  value: string,
  fromBase: Base,
  toBase: Base,
  maxFracDigits = 8
): ConversionResult {
  if (fromBase === toBase) return { result: value.toUpperCase(), steps: [], isInfinite: false }

  if (fromBase === 10 && toBase === 2)  return decToBin(value, maxFracDigits)
  if (fromBase === 10 && toBase === 16) return decToHex(value, maxFracDigits)
  if (fromBase === 2  && toBase === 10) return binToDec(value)
  if (fromBase === 2  && toBase === 16) return binToHex(value)
  if (fromBase === 16 && toBase === 2)  return hexToBin(value)
  if (fromBase === 16 && toBase === 10) return hexToDec(value)

  return { result: '', steps: [], isInfinite: false }
}

export function getBitConcepts(binValue: string): {
  bit: number
  nibble: number
  byte: number
  word: number
  dword: number
} {
  const intPart = binValue.split('.')[0].replace('(…)', '').replace(/^0+/, '') || '0'
  const bits = intPart.length
  return {
    bit: bits,
    nibble: Math.ceil(bits / 4) * 4,
    byte: Math.ceil(bits / 8) * 8,
    word: Math.ceil(bits / 16) * 16,
    dword: Math.ceil(bits / 32) * 32,
  }
}
