import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { uk } from '../../i18n/uk'
import { useCircuitStore } from '../../store/circuitStore'
import { useAppStore } from '../../store/appStore'
import {
  evaluateCircuit,
  generateTruthTable,
  topoSort,
  deriveDnf,
  deriveCnf,
  deriveExpression,
} from './utils/simulation'
import { EXAMPLES } from './utils/examples'
import GateNode from './components/GateNode'
import GatePalette from './components/GatePalette'
import TruthTablePanel from './components/TruthTablePanel'
import GateHelpPanel from './components/GateHelpPanel'
import type { LogicGateType, TruthTableRow } from '../../types'
import { Undo2, Redo2, Trash2, Save, FolderOpen, BookOpen, AlertTriangle } from 'lucide-react'

const NODE_TYPES = { gateNode: GateNode }

let nodeIdCounter = 1
function newNodeId() {
  return `n${Date.now()}_${nodeIdCounter++}`
}

const DEFAULT_INPUT_COUNTS: Record<LogicGateType, number> = {
  INPUT: 0, CONSTANT: 0, BUFFER: 1, NOT: 1,
  AND: 2, OR: 2, NAND: 2, NOR: 2, XOR: 2, OUTPUT: 1,
}

export default function LogicModule() {
  const {
    nodes: storeNodes, edges: storeEdges,
    simulationState, hasCycle,
    setNodes: storeSetNodes, setEdges: storeSetEdges,
    setSimulationState, setHasCycle,
    pushHistory, undo, redo, clearCanvas, loadCircuit,
  } = useCircuitStore()

  const { setActiveModule } = useAppStore()
  useEffect(() => { setActiveModule('/logic') }, [setActiveModule])

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

  const [truthTable, setTruthTable] = useState<TruthTableRow[]>([])
  const [tableVars, setTableVars] = useState<string[]>([])
  const [expression, setExpression] = useState('')
  const [dnf, setDnf] = useState('')
  const [cnf, setCnf] = useState('')
  const [helpGate, setHelpGate] = useState<LogicGateType | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const examplesRef = useRef<HTMLDivElement>(null)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<unknown>(null)

  useEffect(() => {
    setNodes(storeNodes)
    setEdges(storeEdges)
  }, [storeNodes, storeEdges])

  const syncToStore = useCallback((n: Node[], e: Edge[]) => {
    storeSetNodes(n)
    storeSetEdges(e)
  }, [storeSetNodes, storeSetEdges])

  const runSimulation = useCallback((n: Node[], e: Edge[]) => {
    const { hasCycle: cycle } = topoSort(n, e)
    setHasCycle(cycle)
    if (cycle) { setSimulationState({}); return }

    const signals = evaluateCircuit(n, e)
    setSimulationState(signals)

    const inputNodes = n.filter((nd) => {
      const d = nd.data as Record<string, unknown>
      return d.gateType === 'INPUT'
    })
    const outputNode = n.find((nd) => {
      const d = nd.data as Record<string, unknown>
      return d.gateType === 'OUTPUT'
    })

    if (inputNodes.length > 0 && inputNodes.length <= 8 && outputNode) {
      const table = generateTruthTable(n, e, inputNodes.map(x => x.id), outputNode.id)
      setTruthTable(table)
      const vars = inputNodes.map((nd) => String((nd.data as Record<string, unknown>).label ?? nd.id))
      setTableVars(vars)
      setDnf(deriveDnf(table))
      setCnf(deriveCnf(table))
    } else {
      setTruthTable([])
      setTableVars([])
    }

    const expr = deriveExpression(n, e)
    setExpression(expr)
  }, [setHasCycle, setSimulationState])

  useEffect(() => {
    runSimulation(nodes, edges)
  }, [nodes, edges, runSimulation])

  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory()
      const newEdges = addEdge({ ...params, animated: false }, edges)
      setEdges(newEdges)
      syncToStore(nodes, newEdges)
    },
    [edges, nodes, pushHistory, setEdges, syncToStore]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/gateType') as LogicGateType
      if (!type || !reactFlowWrapper.current || !reactFlowInstance) return

      const rf = reactFlowInstance as { screenToFlowPosition: (p: { x: number; y: number }) => { x: number; y: number } }
      const position = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })

      const id = newNodeId()
      const newNode: Node = {
        id,
        type: 'gateNode',
        position,
        data: {
          gateType: type,
          label: type === 'INPUT' ? `x${nodes.filter(n => (n.data as Record<string,unknown>).gateType === 'INPUT').length + 1}` : uk.logic.gates[type],
          inputCount: DEFAULT_INPUT_COUNTS[type],
          constantValue: type === 'CONSTANT' ? 0 : undefined,
          inputValue: type === 'INPUT' ? 0 : undefined,
        },
      }

      pushHistory()
      const newNodes = [...nodes, newNode]
      setNodes(newNodes)
      syncToStore(newNodes, edges)
    },
    [reactFlowInstance, nodes, edges, pushHistory, setNodes, syncToStore]
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)
      const hasDelete = changes.some((c) => c.type === 'remove')
      if (hasDelete) pushHistory()
    },
    [onNodesChange, pushHistory]
  )

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes)
      const hasDelete = changes.some((c) => c.type === 'remove')
      if (hasDelete) pushHistory()
    },
    [onEdgesChange, pushHistory]
  )

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    const d = node.data as Record<string, unknown>
    if (d.gateType) setHelpGate(d.gateType as LogicGateType)
  }, [])

  const handleSave = async () => {
    const data = JSON.stringify({ nodes, edges }, null, 2)
    const name = `scheme_${new Date().toISOString().slice(0, 10)}`
    if (window.electronAPI) {
      const res = await window.electronAPI.saveCircuit({ name, data })
      if (res.success) {
        setNotification(uk.logic.saved)
        setTimeout(() => setNotification(null), 2000)
      }
    } else {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${name}.json`; a.click()
      URL.revokeObjectURL(url)
      setNotification(uk.logic.saved)
      setTimeout(() => setNotification(null), 2000)
    }
  }

  const handleLoad = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.loadCircuit()
      if (res.success && res.data) {
        const { nodes: n, edges: e } = JSON.parse(res.data)
        pushHistory()
        loadCircuit(n, e)
        setNotification(uk.logic.loaded)
        setTimeout(() => setNotification(null), 2000)
      }
    }
  }

  const loadExample = (key: string) => {
    const ex = EXAMPLES[key]
    if (!ex) return
    pushHistory()
    loadCircuit(ex.nodes, ex.edges)
    setShowExamples(false)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.ctrlKey && e.key === 'z') { undo(); return }
      if (e.ctrlKey && e.key === 'y') { redo(); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  useEffect(() => {
    if (!showExamples) return
    const handler = (e: MouseEvent) => {
      if (examplesRef.current && !examplesRef.current.contains(e.target as HTMLElement)) {
        setShowExamples(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showExamples])

  const edgeColor = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId)
    if (!edge) return '#6b7280'
    const signal = simulationState[edge.source]
    if (signal === 1) return '#22c55e'
    if (signal === 0) return '#ef4444'
    return '#6b7280'
  }

  const styledEdges = edges.map((e) => ({
    ...e,
    style: { stroke: edgeColor(e.id), strokeWidth: 2 },
  }))

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-48 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto scrollbar-thin bg-white dark:bg-gray-800">
        <GatePalette onDragStart={() => {}} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex-wrap">
          <button className="btn-ghost text-xs" onClick={undo} aria-label={uk.logic.undo} title={uk.logic.undo + ' (Ctrl+Z)'}><Undo2 className="w-4 h-4" /></button>
          <button className="btn-ghost text-xs" onClick={() => { redo() }} aria-label={uk.logic.redo} title={uk.logic.redo + ' (Ctrl+Y)'}><Redo2 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          <button className="btn-secondary text-xs" onClick={clearCanvas} aria-label={uk.logic.clear}><Trash2 className="w-4 h-4" />{uk.logic.clear}</button>
          <button className="btn-secondary text-xs" onClick={handleSave} aria-label={uk.logic.save}><Save className="w-4 h-4" />{uk.logic.save}</button>
          <button className="btn-secondary text-xs" onClick={handleLoad} aria-label={uk.logic.load}><FolderOpen className="w-4 h-4" />{uk.logic.load}</button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          <div className="relative" ref={examplesRef}>
            <button className="btn-secondary text-xs" onClick={() => setShowExamples(!showExamples)} aria-label={uk.logic.examplesBtn}><BookOpen className="w-4 h-4" />{uk.logic.examplesBtn}</button>
            {showExamples && (
              <div className="absolute top-full left-0 mt-1 w-52 card z-50 py-1 shadow-lg">
                {Object.entries(uk.logic.examples).map(([key, label]) => (
                  <button
                    key={key}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => loadExample(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasCycle && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              {uk.logic.cycleWarning}
            </div>
          )}

          {notification && (
            <div className="text-xs text-green-600 dark:text-green-400 ml-2">{notification}</div>
          )}
        </div>

        <div ref={reactFlowWrapper} className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={NODE_TYPES}
            onNodeClick={handleNodeClick}
            fitView
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Control"
            selectNodesOnDrag={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
          </ReactFlow>
        </div>

        <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          <span>{uk.logic.hint.drag}</span>
          <span>•</span>
          <span>{uk.logic.hint.delete}</span>
          <span>•</span>
          <span>{uk.logic.hint.undo}</span>
        </div>
      </div>

      <div className="w-72 border-l border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 bg-white dark:bg-gray-800 overflow-hidden">
        {helpGate && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <GateHelpPanel gateType={helpGate} onClose={() => setHelpGate(null)} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {truthTable.length > 0 ? (
            <TruthTablePanel
              table={truthTable}
              variables={tableVars}
              expression={expression}
              dnf={dnf}
              cnf={cnf}
            />
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              {hasCycle
                ? uk.logic.cycleDetected
                : uk.logic.noInputs}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
