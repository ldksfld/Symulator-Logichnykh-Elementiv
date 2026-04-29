import { describe, it, expect } from 'vitest'
import { parseExpression, evalAST, extractVariables, buildTruthTable, buildDnf, buildCnf } from '../../src/renderer/modules/boolean/utils/parser'

describe('parseExpression + evalAST', () => {
  it('evaluates A & B', () => {
    const ast = parseExpression('A & B')
    expect(evalAST(ast, { A: 1, B: 1 })).toBe(1)
    expect(evalAST(ast, { A: 1, B: 0 })).toBe(0)
  })

  it('evaluates A | B', () => {
    const ast = parseExpression('A | B')
    expect(evalAST(ast, { A: 0, B: 0 })).toBe(0)
    expect(evalAST(ast, { A: 0, B: 1 })).toBe(1)
  })

  it('evaluates !A', () => {
    const ast = parseExpression('!A')
    expect(evalAST(ast, { A: 0 })).toBe(1)
    expect(evalAST(ast, { A: 1 })).toBe(0)
  })

  it('evaluates A ^ B (XOR)', () => {
    const ast = parseExpression('A ^ B')
    expect(evalAST(ast, { A: 1, B: 1 })).toBe(0)
    expect(evalAST(ast, { A: 1, B: 0 })).toBe(1)
  })

  it('evaluates complex expression with parens', () => {
    const ast = parseExpression('(A & B) | !C')
    expect(evalAST(ast, { A: 1, B: 1, C: 0 })).toBe(1)
    expect(evalAST(ast, { A: 0, B: 1, C: 1 })).toBe(0)
  })

  it('accepts AND/OR/NOT keywords', () => {
    const ast = parseExpression('A AND B OR NOT C')
    expect(evalAST(ast, { A: 1, B: 1, C: 0 })).toBe(1)
  })
})

describe('extractVariables', () => {
  it('extracts sorted variables', () => {
    const ast = parseExpression('C & A | B')
    expect(extractVariables(ast)).toEqual(['A', 'B', 'C'])
  })
})

describe('buildTruthTable', () => {
  it('builds 4-row table for 2 vars', () => {
    const { table, variables } = buildTruthTable('A & B')
    expect(table.length).toBe(4)
    expect(variables).toEqual(['A', 'B'])
    expect(table[3].output).toBe(1)
    expect(table[0].output).toBe(0)
  })

  it('builds 8-row table for 3 vars', () => {
    const { table } = buildTruthTable('A | B | C')
    expect(table.length).toBe(8)
  })

  it('throws for more than 4 variables', () => {
    expect(() => buildTruthTable('A & B & C & D & E')).toThrow()
  })
})

describe('buildDnf / buildCnf', () => {
  it('DNF for A & B has one minterm', () => {
    const { table, variables } = buildTruthTable('A & B')
    const dnf = buildDnf(table, variables)
    expect(dnf).toContain('A')
    expect(dnf).toContain('B')
  })

  it('CNF for A | B has one maxterm', () => {
    const { table, variables } = buildTruthTable('A | B')
    const cnf = buildCnf(table, variables)
    expect(cnf).toBeDefined()
  })

  it('returns 0 for always-false expression', () => {
    const { table, variables } = buildTruthTable('A & !A')
    expect(buildDnf(table, variables)).toBe('0')
  })

  it('returns 1 for tautology', () => {
    const { table, variables } = buildTruthTable('A | !A')
    expect(buildDnf(table, variables)).toBe('1')
  })
})
