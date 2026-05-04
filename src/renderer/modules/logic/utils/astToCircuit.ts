import type { Node, Edge } from '@xyflow/react'
import type { ASTNode } from '../../boolean/utils/parser'
import { parseExpression, extractVariables } from '../../boolean/utils/parser'

const COL_W = 180
const ROW_H = 90

interface BuildContext {
  nodes: Node[]
  edges: Edge[]
  inputMap: Map<string, string>
  counter: { value: number }
  edgeCounter: { value: number }
  rowAtCol: Map<number, number>
  maxDepth: number
}

function nextId(ctx: BuildContext): string {
  ctx.counter.value += 1
  return `g${ctx.counter.value}`
}

function nextEdgeId(ctx: BuildContext): string {
  ctx.edgeCounter.value += 1
  return `e${ctx.edgeCounter.value}`
}

function astDepth(ast: ASTNode): number {
  if (ast.type === 'VAR' || ast.type === 'CONST') {
    return 0
  }

  if (ast.type === 'NOT') {
    return 1 + astDepth(ast.operand)
  }

  return 1 + Math.max(astDepth(ast.left), astDepth(ast.right))
}

function placeAtCol(ctx: BuildContext, col: number): { x: number; y: number } {
  const row = ctx.rowAtCol.get(col) ?? 0
  ctx.rowAtCol.set(col, row + 1)
  return {
    x: 60 + col * COL_W,
    y: 40 + row * ROW_H,
  }
}

function buildNode(ast: ASTNode, depth: number, ctx: BuildContext): string {
  if (ast.type === 'VAR') {
    const existing = ctx.inputMap.get(ast.name)

    if (existing) {
      return existing
    }

    const id = nextId(ctx)
    ctx.inputMap.set(ast.name, id)

    ctx.nodes.push({
      id,
      type: 'gateNode',
      position: placeAtCol(ctx, 0),
      data: { gateType: 'INPUT', label: ast.name, inputValue: 0, inputCount: 0 },
    })

    return id
  }

  if (ast.type === 'CONST') {
    const id = nextId(ctx)
    const col = Math.max(1, depth)

    ctx.nodes.push({
      id,
      type: 'gateNode',
      position: placeAtCol(ctx, col),
      data: {
        gateType: 'CONSTANT',
        label: String(ast.value),
        constantValue: ast.value,
        inputCount: 0,
      },
    })

    return id
  }

  if (ast.type === 'NOT') {
    const childId = buildNode(ast.operand, depth - 1, ctx)
    const id = nextId(ctx)
    const col = depth

    ctx.nodes.push({
      id,
      type: 'gateNode',
      position: placeAtCol(ctx, col),
      data: { gateType: 'NOT', label: 'НЕ', inputCount: 1 },
    })

    ctx.edges.push({
      id: nextEdgeId(ctx),
      source: childId,
      target: id,
      sourceHandle: 'out',
      targetHandle: 'in-0',
    })

    return id
  }

  const leftId = buildNode(ast.left, depth - 1, ctx)
  const rightId = buildNode(ast.right, depth - 1, ctx)
  const gateType = ast.type
  const labelMap: Record<string, string> = { AND: 'І', OR: 'АБО', XOR: 'XOR' }
  const id = nextId(ctx)
  const col = depth

  ctx.nodes.push({
    id,
    type: 'gateNode',
    position: placeAtCol(ctx, col),
    data: { gateType, label: labelMap[gateType], inputCount: 2 },
  })

  ctx.edges.push({
    id: nextEdgeId(ctx),
    source: leftId,
    target: id,
    sourceHandle: 'out',
    targetHandle: 'in-0',
  })

  ctx.edges.push({
    id: nextEdgeId(ctx),
    source: rightId,
    target: id,
    sourceHandle: 'out',
    targetHandle: 'in-1',
  })

  return id
}

export function expressionToCircuit(
  expression: string
): { nodes: Node[]; edges: Edge[] } | null {
  const trimmed = expression.trim()

  if (!trimmed) {
    return null
  }

  let ast: ASTNode

  try {
    ast = parseExpression(trimmed)
  } catch {
    return null
  }

  const vars = extractVariables(ast)

  if (vars.length > 8) {
    return null
  }

  const maxDepth = astDepth(ast)
  const ctx: BuildContext = {
    nodes: [],
    edges: [],
    inputMap: new Map(),
    counter: { value: 0 },
    edgeCounter: { value: 0 },
    rowAtCol: new Map(),
    maxDepth,
  }

  const rootId = buildNode(ast, maxDepth, ctx)

  const outId = nextId(ctx)
  const outCol = maxDepth + 1

  ctx.nodes.push({
    id: outId,
    type: 'gateNode',
    position: placeAtCol(ctx, outCol),
    data: { gateType: 'OUTPUT', label: 'Y', inputCount: 1 },
  })

  ctx.edges.push({
    id: nextEdgeId(ctx),
    source: rootId,
    target: outId,
    sourceHandle: 'out',
    targetHandle: 'in-0',
  })

  return { nodes: ctx.nodes, edges: ctx.edges }
}
