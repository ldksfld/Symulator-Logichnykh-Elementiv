import type { Node, Edge } from '@xyflow/react'

type Example = { nodes: Node[]; edges: Edge[] }

export const EXAMPLES: Record<string, Example> = {
  invertOnNand: {
    nodes: [
      { id: 'in1', type: 'gateNode', position: { x: 50, y: 150 }, data: { gateType: 'INPUT', label: 'x', inputValue: 0, inputCount: 0 } },
      { id: 'nand1', type: 'gateNode', position: { x: 220, y: 130 }, data: { gateType: 'NAND', label: 'І-НЕ', inputCount: 2 } },
      { id: 'out1', type: 'gateNode', position: { x: 400, y: 150 }, data: { gateType: 'OUTPUT', label: 'y', inputCount: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'nand1', target: 'out1', sourceHandle: 'out', targetHandle: 'in-0' },
    ],
  },

  bufferOnNand: {
    nodes: [
      { id: 'in1', type: 'gateNode', position: { x: 50, y: 150 }, data: { gateType: 'INPUT', label: 'x', inputValue: 0, inputCount: 0 } },
      { id: 'nand1', type: 'gateNode', position: { x: 220, y: 110 }, data: { gateType: 'NAND', label: 'І-НЕ 1', inputCount: 2 } },
      { id: 'nand2', type: 'gateNode', position: { x: 380, y: 110 }, data: { gateType: 'NAND', label: 'І-НЕ 2', inputCount: 2 } },
      { id: 'out1', type: 'gateNode', position: { x: 540, y: 130 }, data: { gateType: 'OUTPUT', label: 'y', inputCount: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'nand1', target: 'nand2', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e4', source: 'nand1', target: 'nand2', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e5', source: 'nand2', target: 'out1', sourceHandle: 'out', targetHandle: 'in-0' },
    ],
  },

  andOnNand: {
    nodes: [
      { id: 'in1', type: 'gateNode', position: { x: 50, y: 100 }, data: { gateType: 'INPUT', label: 'A', inputValue: 0, inputCount: 0 } },
      { id: 'in2', type: 'gateNode', position: { x: 50, y: 200 }, data: { gateType: 'INPUT', label: 'B', inputValue: 0, inputCount: 0 } },
      { id: 'nand1', type: 'gateNode', position: { x: 220, y: 130 }, data: { gateType: 'NAND', label: 'І-НЕ 1', inputCount: 2 } },
      { id: 'nand2', type: 'gateNode', position: { x: 380, y: 130 }, data: { gateType: 'NAND', label: 'І-НЕ 2', inputCount: 2 } },
      { id: 'out1', type: 'gateNode', position: { x: 540, y: 150 }, data: { gateType: 'OUTPUT', label: 'A·B', inputCount: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'in2', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'nand1', target: 'nand2', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e4', source: 'nand1', target: 'nand2', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e5', source: 'nand2', target: 'out1', sourceHandle: 'out', targetHandle: 'in-0' },
    ],
  },

  orOnNand: {
    nodes: [
      { id: 'in1', type: 'gateNode', position: { x: 50, y: 100 }, data: { gateType: 'INPUT', label: 'A', inputValue: 0, inputCount: 0 } },
      { id: 'in2', type: 'gateNode', position: { x: 50, y: 210 }, data: { gateType: 'INPUT', label: 'B', inputValue: 0, inputCount: 0 } },
      { id: 'nand1', type: 'gateNode', position: { x: 210, y: 100 }, data: { gateType: 'NAND', label: 'І-НЕ A', inputCount: 2 } },
      { id: 'nand2', type: 'gateNode', position: { x: 210, y: 210 }, data: { gateType: 'NAND', label: 'І-НЕ B', inputCount: 2 } },
      { id: 'nand3', type: 'gateNode', position: { x: 380, y: 150 }, data: { gateType: 'NAND', label: 'І-НЕ 3', inputCount: 2 } },
      { id: 'out1', type: 'gateNode', position: { x: 540, y: 170 }, data: { gateType: 'OUTPUT', label: 'A∨B', inputCount: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'in1', target: 'nand1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'in2', target: 'nand2', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e4', source: 'in2', target: 'nand2', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e5', source: 'nand1', target: 'nand3', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e6', source: 'nand2', target: 'nand3', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e7', source: 'nand3', target: 'out1', sourceHandle: 'out', targetHandle: 'in-0' },
    ],
  },

  halfAdder: {
    nodes: [
      { id: 'a', type: 'gateNode', position: { x: 50, y: 80 }, data: { gateType: 'INPUT', label: 'A', inputValue: 0, inputCount: 0 } },
      { id: 'b', type: 'gateNode', position: { x: 50, y: 200 }, data: { gateType: 'INPUT', label: 'B', inputValue: 0, inputCount: 0 } },
      { id: 'xor1', type: 'gateNode', position: { x: 230, y: 100 }, data: { gateType: 'XOR', label: 'XOR (⊕)', inputCount: 2 } },
      { id: 'and1', type: 'gateNode', position: { x: 230, y: 210 }, data: { gateType: 'AND', label: 'І', inputCount: 2 } },
      { id: 'sum', type: 'gateNode', position: { x: 420, y: 100 }, data: { gateType: 'OUTPUT', label: 'Сума', inputCount: 1 } },
      { id: 'carry', type: 'gateNode', position: { x: 420, y: 210 }, data: { gateType: 'OUTPUT', label: 'Перенос', inputCount: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'a', target: 'xor1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2', source: 'b', target: 'xor1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3', source: 'a', target: 'and1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e4', source: 'b', target: 'and1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e5', source: 'xor1', target: 'sum', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e6', source: 'and1', target: 'carry', sourceHandle: 'out', targetHandle: 'in-0' },
    ],
  },

  fullAdder: {
    nodes: [
      { id: 'a',    type: 'gateNode', position: { x: 50,  y: 60  }, data: { gateType: 'INPUT',  label: 'A',   inputValue: 0, inputCount: 0 } },
      { id: 'b',    type: 'gateNode', position: { x: 50,  y: 170 }, data: { gateType: 'INPUT',  label: 'B',   inputValue: 0, inputCount: 0 } },
      { id: 'cin',  type: 'gateNode', position: { x: 50,  y: 280 }, data: { gateType: 'INPUT',  label: 'Cin', inputValue: 0, inputCount: 0 } },
      { id: 'xor1', type: 'gateNode', position: { x: 230, y: 100 }, data: { gateType: 'XOR',    label: 'XOR1',inputCount: 2 } },
      { id: 'xor2', type: 'gateNode', position: { x: 410, y: 160 }, data: { gateType: 'XOR',    label: 'XOR2',inputCount: 2 } },
      { id: 'and1', type: 'gateNode', position: { x: 230, y: 230 }, data: { gateType: 'AND',    label: 'AND1',inputCount: 2 } },
      { id: 'and2', type: 'gateNode', position: { x: 410, y: 290 }, data: { gateType: 'AND',    label: 'AND2',inputCount: 2 } },
      { id: 'or1',  type: 'gateNode', position: { x: 580, y: 255 }, data: { gateType: 'OR',     label: 'OR',  inputCount: 2 } },
      { id: 'sum',  type: 'gateNode', position: { x: 580, y: 160 }, data: { gateType: 'OUTPUT', label: 'Сума',inputCount: 1 } },
      { id: 'cout', type: 'gateNode', position: { x: 730, y: 255 }, data: { gateType: 'OUTPUT', label: 'Cout',inputCount: 1 } },
    ],
    edges: [
      { id: 'e1',  source: 'a',    target: 'xor1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e2',  source: 'b',    target: 'xor1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e3',  source: 'xor1', target: 'xor2', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e4',  source: 'cin',  target: 'xor2', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e5',  source: 'a',    target: 'and1', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e6',  source: 'b',    target: 'and1', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e7',  source: 'xor1', target: 'and2', sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e8',  source: 'cin',  target: 'and2', sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e9',  source: 'and1', target: 'or1',  sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e10', source: 'and2', target: 'or1',  sourceHandle: 'out', targetHandle: 'in-1' },
      { id: 'e11', source: 'xor2', target: 'sum',  sourceHandle: 'out', targetHandle: 'in-0' },
      { id: 'e12', source: 'or1',  target: 'cout', sourceHandle: 'out', targetHandle: 'in-0' },
    ],
  },
}
