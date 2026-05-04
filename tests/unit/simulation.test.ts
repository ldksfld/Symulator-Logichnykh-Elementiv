import { describe, it, expect } from 'vitest'
import { evaluateGate, evaluateCircuit, topoSort, generateTruthTable } from '../../src/renderer/modules/logic/utils/simulation'
import type { Node, Edge } from '@xyflow/react'

describe('evaluateGate', () => {
  it('BUFFER passes through', () => {
    expect(evaluateGate('BUFFER', [1])).toBe(1)
    expect(evaluateGate('BUFFER', [0])).toBe(0)
  })

  it('NOT inverts', () => {
    expect(evaluateGate('NOT', [0])).toBe(1)
    expect(evaluateGate('NOT', [1])).toBe(0)
  })

  it('AND truth table', () => {
    expect(evaluateGate('AND', [0, 0])).toBe(0)
    expect(evaluateGate('AND', [0, 1])).toBe(0)
    expect(evaluateGate('AND', [1, 0])).toBe(0)
    expect(evaluateGate('AND', [1, 1])).toBe(1)
  })

  it('OR truth table', () => {
    expect(evaluateGate('OR', [0, 0])).toBe(0)
    expect(evaluateGate('OR', [0, 1])).toBe(1)
    expect(evaluateGate('OR', [1, 0])).toBe(1)
    expect(evaluateGate('OR', [1, 1])).toBe(1)
  })

  it('NAND truth table', () => {
    expect(evaluateGate('NAND', [0, 0])).toBe(1)
    expect(evaluateGate('NAND', [0, 1])).toBe(1)
    expect(evaluateGate('NAND', [1, 0])).toBe(1)
    expect(evaluateGate('NAND', [1, 1])).toBe(0)
  })

  it('NOR truth table', () => {
    expect(evaluateGate('NOR', [0, 0])).toBe(1)
    expect(evaluateGate('NOR', [0, 1])).toBe(0)
    expect(evaluateGate('NOR', [1, 0])).toBe(0)
    expect(evaluateGate('NOR', [1, 1])).toBe(0)
  })

  it('returns null when any input is null', () => {
    expect(evaluateGate('AND', [null, 1])).toBeNull()
  })
})

describe('topoSort', () => {
  it('sorts a simple 3-node chain', () => {
    const nodes: Node[] = [
      { id: 'a', type: 'gateNode', position: {x:0,y:0}, data: {} },
      { id: 'b', type: 'gateNode', position: {x:0,y:0}, data: {} },
      { id: 'c', type: 'gateNode', position: {x:0,y:0}, data: {} },
    ]
    const edges: Edge[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' },
    ]
    const { order, hasCycle } = topoSort(nodes, edges)
    expect(hasCycle).toBe(false)
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'))
  })

  it('detects cycle', () => {
    const nodes: Node[] = [
      { id: 'a', type: 'gateNode', position: {x:0,y:0}, data: {} },
      { id: 'b', type: 'gateNode', position: {x:0,y:0}, data: {} },
    ]
    const edges: Edge[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'a' },
    ]
    const { hasCycle } = topoSort(nodes, edges)
    expect(hasCycle).toBe(true)
  })
})

describe('evaluateCircuit — NAND inverter', () => {
  const makeCircuit = (inputVal: 0 | 1) => {
    const nodes: Node[] = [
      { id: 'in1', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'INPUT', inputValue: inputVal, inputCount: 0 } },
      { id: 'nand1', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'NAND', inputCount: 2 } },
      { id: 'out1', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'OUTPUT', inputCount: 1 } },
    ]
    const edges: Edge[] = [
      { id: 'e1', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'nand1', target: 'out1', sourceHandle: 'out', targetHandle: 'in-0' },
    ]
    return { nodes, edges }
  }

  it('NAND inverter: 0 → 1', () => {
    const { nodes, edges } = makeCircuit(0)
    const signals = evaluateCircuit(nodes, edges)
    expect(signals['out1']).toBe(1)
  })

  it('NAND inverter: 1 → 0', () => {
    const { nodes, edges } = makeCircuit(1)
    const signals = evaluateCircuit(nodes, edges)
    expect(signals['out1']).toBe(0)
  })
})

describe('generateTruthTable', () => {
  it('generates 4 rows for 2 inputs', () => {
    const nodes: Node[] = [
      { id: 'a', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'INPUT', inputValue: 0, inputCount: 0, label: 'A' } },
      { id: 'b', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'INPUT', inputValue: 0, inputCount: 0, label: 'B' } },
      { id: 'and1', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'AND', inputCount: 2 } },
      { id: 'out1', type: 'gateNode', position: {x:0,y:0}, data: { gateType: 'OUTPUT', inputCount: 1 } },
    ]
    const edges: Edge[] = [
      { id: 'e1', source: 'a', target: 'and1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'b', target: 'and1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'and1', target: 'out1', sourceHandle: 'out', targetHandle: 'in-0' },
    ]
    const table = generateTruthTable(nodes, edges, ['a', 'b'], 'out1')
    expect(table.length).toBe(4)
    expect(table[0].output).toBe(0)
    expect(table[3].output).toBe(1)
  })
})
