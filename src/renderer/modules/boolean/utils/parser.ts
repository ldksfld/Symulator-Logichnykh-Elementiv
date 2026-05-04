export type ASTNode =
  | { type: 'VAR'; name: string }
  | { type: 'CONST'; value: 0 | 1 }
  | { type: 'NOT'; operand: ASTNode }
  | { type: 'AND'; left: ASTNode; right: ASTNode }
  | { type: 'OR'; left: ASTNode; right: ASTNode }
  | { type: 'XOR'; left: ASTNode; right: ASTNode }

type TokenType = 'VAR' | 'CONST' | 'AND' | 'OR' | 'NOT' | 'XOR' | 'LPAREN' | 'RPAREN' | 'EOF'

interface Token {
  type: TokenType
  value: string
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const e = expr.trim()

  while (i < e.length) {
    const ch = e[i]

    if (/\s/.test(ch)) {
      i++
      continue
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' })
      i++
      continue
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' })
      i++
      continue
    }

    if (ch === '!' || ch === '~' || ch === '¬') {
      tokens.push({ type: 'NOT', value: ch })
      i++
      continue
    }

    if (ch === '&' || ch === '·' || ch === '∧') {
      if (e[i + 1] === '&') {
        i++
      }
      tokens.push({ type: 'AND', value: ch })
      i++
      continue
    }

    if (ch === '|' || ch === '+' || ch === '∨') {
      if (e[i + 1] === '|') {
        i++
      }
      tokens.push({ type: 'OR', value: ch })
      i++
      continue
    }

    if (ch === '^') {
      tokens.push({ type: 'XOR', value: ch })
      i++
      continue
    }

    const rest = e.slice(i)
    const kw = rest.match(/^(AND|OR|NOT|XOR)\b/i)

    if (kw) {
      const k = kw[1].toUpperCase()

      if (k === 'AND') {
        tokens.push({ type: 'AND', value: k })
        i += kw[1].length
        continue
      }

      if (k === 'OR') {
        tokens.push({ type: 'OR', value: k })
        i += kw[1].length
        continue
      }

      if (k === 'NOT') {
        tokens.push({ type: 'NOT', value: k })
        i += kw[1].length
        continue
      }

      if (k === 'XOR') {
        tokens.push({ type: 'XOR', value: k })
        i += kw[1].length
        continue
      }
    }

    if (ch === '0' || ch === '1') {
      tokens.push({ type: 'CONST', value: ch })
      i++
      continue
    }

    if (/[A-Za-z]/.test(ch)) {
      let id = ''

      while (i < e.length && /[A-Za-z0-9_]/.test(e[i])) {
        id += e[i]
        i++
      }

      tokens.push({ type: 'VAR', value: id })
      continue
    }

    throw new Error(`Невідомий символ: "${ch}"`)
  }

  tokens.push({ type: 'EOF', value: '' })
  return tokens
}

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }

  private consume(): Token {
    return this.tokens[this.pos++]
  }

  parse(): ASTNode {
    const node = this.parseOr()

    if (this.peek().type !== 'EOF') {
      throw new Error(`Несподіваний токен: "${this.peek().value}"`)
    }

    return node
  }

  private parseOr(): ASTNode {
    let left = this.parseXor()

    while (this.peek().type === 'OR') {
      this.consume()
      const right = this.parseXor()
      left = { type: 'OR', left, right }
    }

    return left
  }

  private parseXor(): ASTNode {
    let left = this.parseAnd()

    while (this.peek().type === 'XOR') {
      this.consume()
      const right = this.parseAnd()
      left = { type: 'XOR', left, right }
    }

    return left
  }

  private parseAnd(): ASTNode {
    let left = this.parseNot()

    while (this.peek().type === 'AND') {
      this.consume()
      const right = this.parseNot()
      left = { type: 'AND', left, right }
    }

    return left
  }

  private parseNot(): ASTNode {
    if (this.peek().type === 'NOT') {
      this.consume()
      return { type: 'NOT', operand: this.parseNot() }
    }

    return this.parseAtom()
  }

  private parseAtom(): ASTNode {
    const tok = this.peek()

    if (tok.type === 'LPAREN') {
      this.consume()
      const node = this.parseOr()

      if (this.peek().type !== 'RPAREN') {
        throw new Error('Очікується ")"')
      }

      this.consume()
      return node
    }

    if (tok.type === 'CONST') {
      this.consume()
      return { type: 'CONST', value: parseInt(tok.value) as 0 | 1 }
    }

    if (tok.type === 'VAR') {
      this.consume()
      return { type: 'VAR', name: tok.value }
    }

    throw new Error(`Несподіваний токен: "${tok.value}"`)
  }
}

export function parseExpression(expr: string): ASTNode {
  const tokens = tokenize(expr)
  return new Parser(tokens).parse()
}

export function evalAST(node: ASTNode, env: Record<string, 0 | 1>): 0 | 1 {
  switch (node.type) {
    case 'VAR':
      return env[node.name] ?? 0
    case 'CONST':
      return node.value
    case 'NOT':
      return evalAST(node.operand, env) === 1 ? 0 : 1
    case 'AND':
      return evalAST(node.left, env) === 1 && evalAST(node.right, env) === 1 ? 1 : 0
    case 'OR':
      return evalAST(node.left, env) === 1 || evalAST(node.right, env) === 1 ? 1 : 0
    case 'XOR':
      return evalAST(node.left, env) !== evalAST(node.right, env) ? 1 : 0
  }
}

export function extractVariables(node: ASTNode): string[] {
  const vars = new Set<string>()

  function walk(n: ASTNode) {
    if (n.type === 'VAR') {
      vars.add(n.name)
    } else if (n.type === 'NOT') {
      walk(n.operand)
    } else if ('left' in n) {
      walk(n.left)
      walk(n.right)
    }
  }

  walk(node)
  return Array.from(vars).sort()
}

import type { TruthTableRow } from '../../../types'

export function buildTruthTable(expr: string): { table: TruthTableRow[]; variables: string[] } {
  const ast = parseExpression(expr)
  const variables = extractVariables(ast)

  if (variables.length > 4) {
    throw new Error('Підтримується до 4 змінних')
  }

  const n = variables.length
  const total = 1 << n
  const table: TruthTableRow[] = []

  for (let combo = 0; combo < total; combo++) {
    const env: Record<string, 0 | 1> = {}

    for (let i = 0; i < n; i++) {
      env[variables[i]] = ((combo >> (n - 1 - i)) & 1) as 0 | 1
    }

    table.push({ inputs: env, output: evalAST(ast, env) })
  }

  return { table, variables }
}

export function buildDnf(table: TruthTableRow[], variables: string[]): string {
  const minterms = table.filter((r) => r.output === 1)

  if (minterms.length === 0) {
    return '0'
  }

  if (minterms.length === table.length) {
    return '1'
  }

  return minterms
    .map((row) => variables.map((v) => (row.inputs[v] === 1 ? v : `¬${v}`)).join(' · '))
    .join(' + ')
}

export function buildCnf(table: TruthTableRow[], variables: string[]): string {
  const maxterms = table.filter((r) => r.output === 0)

  if (maxterms.length === 0) {
    return '1'
  }

  if (maxterms.length === table.length) {
    return '0'
  }

  return maxterms
    .map((row) => '(' + variables.map((v) => (row.inputs[v] === 0 ? v : `¬${v}`)).join(' + ') + ')')
    .join(' · ')
}

function exprMatchesOriginal(candidate: string, originalAst: ASTNode, variables: string[]): boolean {
  try {
    const candAst = parseExpression(candidate)
    const candVars = new Set(extractVariables(candAst))

    for (const v of candVars) {
      if (!variables.includes(v)) {
        return false
      }
    }

    const n = variables.length
    const total = 1 << n

    for (let combo = 0; combo < total; combo++) {
      const env: Record<string, 0 | 1> = {}

      for (let i = 0; i < n; i++) {
        env[variables[i]] = ((combo >> (n - 1 - i)) & 1) as 0 | 1
      }

      if (evalAST(originalAst, env) !== evalAST(candAst, env)) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

export function simplifyExpression(expr: string): { simplified: string; steps: string[] } {
  const steps: string[] = []
  let current = expr.trim()
  const originalAst = parseExpression(expr)
  const variables = extractVariables(originalAst)

  const rules: Array<{ pattern: RegExp | string; replacement: string; law: string }> = [
    { pattern: /!!([A-Za-z0-9_]+)/g, replacement: '$1', law: 'Закон подвійного заперечення: !!A = A' },
    { pattern: /!\(\s*([A-Za-z0-9_]+)\s*&\s*([A-Za-z0-9_]+)\s*\)/g, replacement: '!$1 | !$2', law: 'Закон де Моргана: !(A & B) = !A | !B' },
    { pattern: /!\(\s*([A-Za-z0-9_]+)\s*\|\s*([A-Za-z0-9_]+)\s*\)/g, replacement: '!$1 & !$2', law: 'Закон де Моргана: !(A | B) = !A & !B' },
    { pattern: /([A-Za-z0-9_]+) & !\1\b/g, replacement: '0', law: 'Закон доповнення: A & !A = 0' },
    { pattern: /!([A-Za-z0-9_]+) & \1\b/g, replacement: '0', law: 'Закон доповнення: !A & A = 0' },
    { pattern: /([A-Za-z0-9_]+) \| !\1\b/g, replacement: '1', law: 'Закон доповнення: A | !A = 1' },
    { pattern: /!([A-Za-z0-9_]+) \| \1\b/g, replacement: '1', law: 'Закон доповнення: !A | A = 1' },
    { pattern: /([A-Za-z0-9_]+) \| \(\s*\1 & [A-Za-z0-9_]+\s*\)/g, replacement: '$1', law: 'Закон поглинання: A | (A & B) = A' },
    { pattern: /([A-Za-z0-9_]+) & \(\s*\1 \| [A-Za-z0-9_]+\s*\)/g, replacement: '$1', law: 'Закон поглинання: A & (A | B) = A' },
    { pattern: /([A-Za-z0-9_]+) & \1/g, replacement: '$1', law: 'Закон ідемпотентності: A & A = A' },
    { pattern: /([A-Za-z0-9_]+) \| \1/g, replacement: '$1', law: 'Закон ідемпотентності: A | A = A' },
    { pattern: /([A-Za-z0-9_]+) & 0/g, replacement: '0', law: 'Закон нуля: A & 0 = 0' },
    { pattern: /0 & ([A-Za-z0-9_]+)/g, replacement: '0', law: 'Закон нуля: 0 & A = 0' },
    { pattern: /([A-Za-z0-9_]+) & 1/g, replacement: '$1', law: 'Закон одиниці: A & 1 = A' },
    { pattern: /1 & ([A-Za-z0-9_]+)/g, replacement: '$1', law: 'Закон одиниці: 1 & A = A' },
    { pattern: /([A-Za-z0-9_]+) \| 0/g, replacement: '$1', law: 'Закон нуля: A | 0 = A' },
    { pattern: /0 \| ([A-Za-z0-9_]+)/g, replacement: '$1', law: 'Закон нуля: 0 | A = A' },
    { pattern: /([A-Za-z0-9_]+) \| 1/g, replacement: '1', law: 'Закон одиниці: A | 1 = 1' },
    { pattern: /1 \| ([A-Za-z0-9_]+)/g, replacement: '1', law: 'Закон одиниці: 1 | A = 1' },
  ]

  let changed = true

  while (changed) {
    changed = false

    for (const rule of rules) {
      const next = current.replace(rule.pattern as RegExp, rule.replacement)

      if (next !== current && exprMatchesOriginal(next, originalAst, variables)) {
        steps.push(rule.law)
        current = next
        changed = true
      }
    }
  }

  if (!exprMatchesOriginal(current, originalAst, variables)) {
    return { simplified: expr.trim(), steps: [] }
  }

  return { simplified: current, steps }
}
