import type { Node, Edge } from '@xyflow/react'
import type { SignalMap, SignalValue, LogicGateType, TruthTableRow } from '../../../types'

export function evaluateGate(type: LogicGateType, inputs: SignalValue[]): SignalValue {
  if (inputs.some((v) => v === null)) return null

  const vals = inputs as (0 | 1)[]

  switch (type) {
    case 'BUFFER':
      return vals[0]
    case 'NOT':
      return vals[0] === 1 ? 0 : 1
    case 'AND':
      return vals.every((v) => v === 1) ? 1 : 0
    case 'OR':
      return vals.some((v) => v === 1) ? 1 : 0
    case 'NAND':
      return vals.every((v) => v === 1) ? 0 : 1
    case 'NOR':
      return vals.some((v) => v === 1) ? 0 : 1
    case 'XOR':
      return (vals.reduce((acc: number, v) => acc ^ v, 0) & 1) as 0 | 1
    case 'CONSTANT':
    case 'INPUT':
    case 'OUTPUT':
      return vals[0] ?? null
    default:
      return null
  }
}

export function topoSort(
  nodes: Node[],
  edges: Edge[]
): { order: string[]; hasCycle: boolean } {
  const graph = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  for (const n of nodes) {
    graph.set(n.id, [])
    inDegree.set(n.id, 0)
  }

  for (const e of edges) {
    graph.get(e.source)?.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const order: string[] = []
  while (queue.length > 0) {
    const node = queue.shift()!
    order.push(node)
    for (const neighbor of graph.get(node) ?? []) {
      const deg = (inDegree.get(neighbor) ?? 1) - 1
      inDegree.set(neighbor, deg)
      if (deg === 0) queue.push(neighbor)
    }
  }

  return {
    order,
    hasCycle: order.length !== nodes.length,
  }
}

export function evaluateCircuit(nodes: Node[], edges: Edge[]): SignalMap {
  const { order, hasCycle } = topoSort(nodes, edges)
  if (hasCycle) return {}

  const signals: SignalMap = {}

  for (const node of nodes) {
    const data = node.data as Record<string, unknown>
    if (data.gateType === 'CONSTANT') {
      signals[node.id] = (data.constantValue as SignalValue) ?? 0
    } else if (data.gateType === 'INPUT') {
      signals[node.id] = (data.inputValue as SignalValue) ?? 0
    }
  }

  for (const nodeId of order) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) continue
    const data = node.data as Record<string, unknown>
    const gateType = data.gateType as LogicGateType

    if (gateType === 'CONSTANT' || gateType === 'INPUT') continue

    const incomingEdges = edges.filter((e) => e.target === nodeId)
    const inputValues: SignalValue[] = incomingEdges
      .sort((a, b) => {
        const aHandle = a.targetHandle ?? ''
        const bHandle = b.targetHandle ?? ''
        return aHandle.localeCompare(bHandle)
      })
      .map((e) => signals[e.source] ?? null)

    if (gateType === 'OUTPUT' || gateType === 'BUFFER') {
      signals[nodeId] = inputValues[0] ?? null
    } else {
      signals[nodeId] = evaluateGate(gateType, inputValues)
    }
  }

  return signals
}

export function generateTruthTable(
  nodes: Node[],
  edges: Edge[],
  inputNodeIds: string[],
  outputNodeId: string
): TruthTableRow[] {
  const n = inputNodeIds.length
  if (n === 0 || n > 8) return []

  const rows: TruthTableRow[] = []
  const total = 1 << n

  for (let combo = 0; combo < total; combo++) {
    const inputValues: Record<string, 0 | 1> = {}
    for (let i = 0; i < n; i++) {
      inputValues[inputNodeIds[i]] = ((combo >> (n - 1 - i)) & 1) as 0 | 1
    }

    const patchedNodes = nodes.map((node) => {
      if (inputNodeIds.includes(node.id)) {
        return {
          ...node,
          data: { ...node.data, inputValue: inputValues[node.id] },
        }
      }
      return node
    })

    const signals = evaluateCircuit(patchedNodes, edges)
    const output = signals[outputNodeId] ?? null

    rows.push({
      inputs: inputValues,
      output: (output ?? 0) as 0 | 1,
    })
  }

  return rows
}

function getNodeExpression(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  visited = new Set<string>()
): string {
  if (visited.has(nodeId)) return '?'
  visited.add(nodeId)

  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return '?'

  const data = node.data as Record<string, unknown>
  const gateType = data.gateType as LogicGateType

  if (gateType === 'INPUT') return String(data.label || node.id)
  if (gateType === 'CONSTANT') return String(data.constantValue ?? 0)

  const incomingEdges = edges.filter((e) => e.target === nodeId)
  const inputExprs = incomingEdges
    .sort((a, b) => (a.targetHandle ?? '').localeCompare(b.targetHandle ?? ''))
    .map((e) => getNodeExpression(e.source, nodes, edges, new Set(visited)))

  switch (gateType) {
    case 'BUFFER':
    case 'OUTPUT':
      return inputExprs[0] ?? '?'
    case 'NOT':
      return `${inputExprs[0] ?? '?'}̅`
    case 'AND':
      return inputExprs.length > 0 ? `(${inputExprs.join(' · ')})` : '?'
    case 'OR':
      return inputExprs.length > 0 ? `(${inputExprs.join(' + ')})` : '?'
    case 'NAND':
      return inputExprs.length > 0 ? `¬(${inputExprs.join(' · ')})` : '?'
    case 'NOR':
      return inputExprs.length > 0 ? `¬(${inputExprs.join(' + ')})` : '?'
    case 'XOR':
      return inputExprs.length > 0 ? `(${inputExprs.join(' ⊕ ')})` : '?'
    default:
      return '?'
  }
}

export function deriveExpression(nodes: Node[], edges: Edge[]): string {
  const outputNode = nodes.find(
    (n) => (n.data as Record<string, unknown>).gateType === 'OUTPUT'
  )
  if (!outputNode) return ''
  return getNodeExpression(outputNode.id, nodes, edges)
}

export function deriveDnf(table: TruthTableRow[]): string {
  const vars = table.length > 0 ? Object.keys(table[0].inputs) : []
  const minterms = table.filter((r) => r.output === 1)
  if (minterms.length === 0) return '0'
  if (minterms.length === table.length) return '1'

  return minterms
    .map((row) =>
      vars
        .map((v) => (row.inputs[v] === 1 ? v : `${v}̅`))
        .join(' · ')
    )
    .join(' + ')
}

export function deriveCnf(table: TruthTableRow[]): string {
  const vars = table.length > 0 ? Object.keys(table[0].inputs) : []
  const maxterms = table.filter((r) => r.output === 0)
  if (maxterms.length === 0) return '1'
  if (maxterms.length === table.length) return '0'

  return maxterms
    .map((row) =>
      '(' +
      vars.map((v) => (row.inputs[v] === 0 ? v : `${v}̅`)).join(' + ') +
      ')'
    )
    .join(' · ')
}
