import type { KarnaughCell, KarnaughGroup } from '../../../types'
import type { TruthTableRow } from '../../../types'

const GRAY_4_ROW = [0, 1, 3, 2]
const GRAY_4_COL = [0, 1, 3, 2]

const GROUP_COLORS = [
  '#ef444466', '#3b82f666', '#22c55e66', '#f59e0b66',
  '#8b5cf666', '#ec489966', '#06b6d466', '#84cc1666',
]

export interface KarnaughMap {
  cells: KarnaughCell[]
  groups: KarnaughGroup[]
  vars: string[]
  rows: number
  cols: number
  rowVars: string[]
  colVars: string[]
  rowLabels: string[]
  colLabels: string[]
}

function mintermsFromTable(table: TruthTableRow[]): number[] {
  return table
    .map((row, i) => ({ idx: i, output: row.output }))
    .filter((r) => r.output === 1)
    .map((r) => r.idx)
}

function buildCells(table: TruthTableRow[]): KarnaughCell[] {
  return table.map((row, i) => ({
    minterm: i,
    value: row.output,
    groupIds: [],
  }))
}

function getKarnaughIndex2(minterm: number): [number, number] {
  return [GRAY_4_ROW.indexOf(minterm >> 1), GRAY_4_COL.indexOf(minterm & 1)]
}

function getKarnaughIndex3(minterm: number): [number, number] {
  const rowBit = (minterm >> 2) & 1        // var0
  const colBits = minterm & 3              // var1, var2
  return [rowBit, GRAY_4_COL.indexOf(colBits)]
}

function getKarnaughIndex4(minterm: number): [number, number] {
  const rowBits = (minterm >> 2) & 3
  const colBits = minterm & 3
  return [GRAY_4_ROW.indexOf(rowBits), GRAY_4_COL.indexOf(colBits)]
}

function isPowerOf2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

function groupMinterms(minterms: number[], varNames: string[]): KarnaughGroup[] {
  const totalVars = varNames.length
  const total = 1 << totalVars
  const ones = new Set(minterms)
  const groups: KarnaughGroup[] = []
  const covered = new Set<number>()
  let colorIdx = 0

  for (let size = Math.min(8, total); size >= 1; size = size >> 1) {
    if (!isPowerOf2(size)) continue

    const grayOrder = getGrayOrder(totalVars)
    const len = grayOrder.length

    for (let start = 0; start < len; start++) {
      const window: number[] = []
      for (let j = 0; j < size; j++) {
        window.push(grayOrder[(start + j) % len])
      }
      if (window.every((m) => ones.has(m)) && !window.every((m) => covered.has(m))) {
        const id = `g${groups.length}`
        const windowMinterms = [...window]
        const expr = buildGroupExpression(windowMinterms, varNames)
        groups.push({
          id,
          cells: windowMinterms,
          color: GROUP_COLORS[colorIdx % GROUP_COLORS.length],
          expression: expr,
        })
        windowMinterms.forEach((m) => covered.add(m))
        colorIdx++
      }
    }
  }

  return groups
}

function getGrayOrder(vars: number): number[] {
  const total = 1 << vars
  const order: number[] = []
  for (let i = 0; i < total; i++) {
    order.push(i ^ (i >> 1))
  }
  return order
}

function buildGroupExpression(minterms: number[], varNames: string[]): string {
  if (minterms.length === 0) return ''
  const vars = varNames.length

  let mask = (1 << vars) - 1
  const first = minterms[0]
  for (const m of minterms) {
    mask &= ~(first ^ m)
  }

  const terms: string[] = []
  for (let i = 0; i < vars; i++) {
    const bit = vars - 1 - i
    if (mask & (1 << bit)) {
      const value = (first >> bit) & 1
      terms.push(value === 1 ? varNames[i] : `¬${varNames[i]}`)
    }
  }

  return terms.length > 0 ? terms.join(' · ') : '1'
}

export function buildKarnaughMap(table: TruthTableRow[], vars: string[]): KarnaughMap {
  const n = vars.length
  const cells = buildCells(table)
  const minterms = mintermsFromTable(table)
  const groups = groupMinterms(minterms, vars)

  for (const group of groups) {
    for (const m of group.cells) {
      const cell = cells.find((c) => c.minterm === m)
      if (cell) cell.groupIds.push(group.id)
    }
  }

  let rows: number, cols: number
  let rowVars: string[], colVars: string[]
  let rowLabels: string[], colLabels: string[]

  if (n === 2) {
    rows = 2; cols = 2
    rowVars = [vars[0]]; colVars = [vars[1]]
    rowLabels = ['0', '1']
    colLabels = ['0', '1']
  } else if (n === 3) {
    rows = 2; cols = 4
    rowVars = [vars[0]]; colVars = [vars[1], vars[2]]
    rowLabels = ['0', '1']
    colLabels = ['00', '01', '11', '10']
  } else {
    rows = 4; cols = 4
    rowVars = [vars[0], vars[1]]; colVars = [vars[2], vars[3]]
    rowLabels = ['00', '01', '11', '10']
    colLabels = ['00', '01', '11', '10']
  }

  return { cells, groups, vars, rows, cols, rowVars, colVars, rowLabels, colLabels }
}

export function getCellPosition(minterm: number, vars: string[]): [number, number] {
  const n = vars.length
  if (n === 2) return getKarnaughIndex2(minterm)
  if (n === 3) return getKarnaughIndex3(minterm)
  return getKarnaughIndex4(minterm)
}
