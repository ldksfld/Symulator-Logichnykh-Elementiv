import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
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
import InputsPanel from './components/InputsPanel'
import type { LogicGateType, TruthTableRow } from '../../types'
import { Undo2, Redo2, Trash2, Save, FolderOpen, BookOpen, AlertTriangle, PlayCircle, StepForward, StopCircle } from 'lucide-react'

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
    stepSimulation, stepIndex, stepOrder,
    startStepSimulation, advanceStep, stopStepSimulation,
  } = useCircuitStore()

  const { setActiveModule } = useAppStore()

  useEffect(() => {
    setActiveModule('/logic')
  }, [setActiveModule])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sleschi-pending-circuit')

      if (!raw) {
        return
      }

      sessionStorage.removeItem('sleschi-pending-circuit')

      const parsed = JSON.parse(raw)

      if (Array.isArray(parsed?.nodes) && Array.isArray(parsed?.edges)) {
        pushHistory()
        loadCircuit(parsed.nodes, parsed.edges)
      }
    } catch {
    }
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

  const [truthTable, setTruthTable] = useState<TruthTableRow[]>([])
  const [tableVars, setTableVars] = useState<string[]>([])
  const [expression, setExpression] = useState('')
  const [dnf, setDnf] = useState('')
  const [cnf, setCnf] = useState('')
  const [helpGate, setHelpGate] = useState<LogicGateType | null>(null)
  const [helpNodeId, setHelpNodeId] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const examplesRef = useRef<HTMLDivElement>(null)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<unknown>(null)
  const [paletteWidth, setPaletteWidth] = useState<number>(() => {
    const stored = parseInt(localStorage.getItem('sleschi-palette-width') ?? '')
    return Number.isFinite(stored) && stored >= 140 && stored <= 480 ? stored : 192
  })
  const paletteResizeRef = useRef<{ startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    localStorage.setItem('sleschi-palette-width', String(paletteWidth))
  }, [paletteWidth])

  const startPaletteResize = (e: React.MouseEvent) => {
    e.preventDefault()
    paletteResizeRef.current = { startX: e.clientX, startWidth: paletteWidth }

    const onMove = (ev: MouseEvent) => {
      if (!paletteResizeRef.current) {
        return
      }

      const delta = ev.clientX - paletteResizeRef.current.startX
      const next = Math.max(140, Math.min(480, paletteResizeRef.current.startWidth + delta))
      setPaletteWidth(next)
    }

    const onUp = () => {
      paletteResizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

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

    if (cycle) {
      setSimulationState({})
      return
    }

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
      const vars = inputNodes.map((nd) => String((nd.data as Record<string, unknown>).label ?? nd.id))
      const labeledTable = table.map((row) => ({
        inputs: Object.fromEntries(
          inputNodes.map((nd, idx) => [vars[idx], row.inputs[nd.id] ?? 0])
        ),
        output: row.output,
      }))

      setTruthTable(labeledTable)
      setTableVars(vars)

      setDnf(deriveDnf(labeledTable))
      setCnf(deriveCnf(labeledTable))
    } else {
      setTruthTable([])
      setTableVars([])
      setDnf('')
      setCnf('')
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

      if (!type || !reactFlowWrapper.current || !reactFlowInstance) {
        return
      }

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
      const isDestructive = changes.some((c) => c.type === 'remove')
      const next = applyNodeChanges(changes, nodes)

      if (isDestructive) {
        pushHistory()
      }

      setNodes(next)
      syncToStore(next, edges)
    },
    [nodes, edges, pushHistory, setNodes, syncToStore]
  )

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      const isDestructive = changes.some((c) => c.type === 'remove')
      const next = applyEdgeChanges(changes, edges)

      if (isDestructive) {
        pushHistory()
      }

      setEdges(next)
      syncToStore(nodes, next)
    },
    [nodes, edges, pushHistory, setEdges, syncToStore]
  )

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    const d = node.data as Record<string, unknown>

    if (d.gateType) {
      setHelpGate(d.gateType as LogicGateType)
      setHelpNodeId(node.id)
    }
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

      a.href = url
      a.download = `${name}.json`
      a.click()

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

    if (!ex) {
      return
    }

    pushHistory()
    loadCircuit(ex.nodes, ex.edges)
    setShowExamples(false)
  }

  const handleStartStep = useCallback(() => {
    const { order, hasCycle: cycle } = topoSort(nodes, edges)

    if (cycle || order.length === 0) {
      return
    }

    startStepSimulation(order)
  }, [nodes, edges, startStepSimulation])

  useEffect(() => {
    if (!stepSimulation) {
      return
    }

    if (nodes.length === 0) {
      stopStepSimulation()
      return
    }
  }, [nodes.length, stepSimulation, stopStepSimulation])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const tag = target?.tagName

      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return
      }

      const key = e.key.toLowerCase()

      if (e.ctrlKey && !e.shiftKey && !e.altKey && key === 'z') {
        e.preventDefault()
        e.stopPropagation()
        undo()
        return
      }

      if (e.ctrlKey && !e.shiftKey && !e.altKey && key === 'y') {
        e.preventDefault()
        e.stopPropagation()
        redo()
        return
      }

      if (e.ctrlKey && !e.shiftKey && !e.altKey && key === 'a') {
        e.preventDefault()
        e.stopPropagation()
        setNodes((arr) => arr.map((n) => ({ ...n, selected: true })))
        setEdges((arr) => arr.map((ed) => ({ ...ed, selected: true })))
        return
      }

      if (e.key === 'Escape') {
        setNodes((arr) => arr.map((n) => ({ ...n, selected: false })))
        setEdges((arr) => arr.map((ed) => ({ ...ed, selected: false })))
        setHelpGate(null)
        setHelpNodeId(null)

        if (showExamples) {
          setShowExamples(false)
        }

        return
      }
    }

    document.addEventListener('keydown', handler, true)

    return () => document.removeEventListener('keydown', handler, true)
  }, [undo, redo, setNodes, setEdges, showExamples])

  useEffect(() => {
    if (!showExamples) {
      return
    }

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

    if (!edge) {
      return '#6b7280'
    }

    const signal = simulationState[edge.source]

    if (signal === 1) {
      return '#22c55e'
    }

    if (signal === 0) {
      return '#ef4444'
    }

    return '#6b7280'
  }

  const activeStepNodeId =
    stepSimulation && stepIndex >= 0 && stepIndex < stepOrder.length
      ? stepOrder[stepIndex]
      : null
  const completedStepIds = new Set(
    stepSimulation && stepIndex >= 0 ? stepOrder.slice(0, stepIndex) : []
  )

  const styledNodes = stepSimulation
    ? nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          stepActive: n.id === activeStepNodeId,
          stepDone: completedStepIds.has(n.id),
          stepPending:
            stepSimulation && !completedStepIds.has(n.id) && n.id !== activeStepNodeId,
        },
      }))
    : nodes

  const styledEdges = edges.map((e) => ({
    ...e,
    animated: stepSimulation
      ? completedStepIds.has(e.source) && completedStepIds.has(e.target)
      : simulationState[e.source] === 1,
    style: { stroke: edgeColor(e.id), strokeWidth: 2 },
  }))

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className="border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto scrollbar-thin bg-white dark:bg-gray-800 relative"
        style={{ width: paletteWidth }}
      >
        <GatePalette
          onDragStart={() => {}}
          onShowHelp={(t) => { setHelpGate(t); setHelpNodeId(null) }}
        />
        <div
          onMouseDown={startPaletteResize}
          className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-accent-400/40 active:bg-accent-500/60 transition-colors z-10"
          title="Перетягніть, щоб змінити ширину палітри"
          aria-label="Resize palette"
        />
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
          {!stepSimulation ? (
            <button
              className="btn-secondary text-xs"
              onClick={handleStartStep}
              disabled={hasCycle || nodes.length === 0}
              aria-label={uk.logic.stepStart}
              title={uk.logic.stepStart}
            >
              <PlayCircle className="w-4 h-4" />{uk.logic.stepStart}
            </button>
          ) : (
            <>
              <button
                className="btn-primary text-xs"
                onClick={advanceStep}
                disabled={stepIndex >= stepOrder.length - 1}
                aria-label={uk.logic.stepNext}
                title={uk.logic.stepNext}
              >
                <StepForward className="w-4 h-4" />{uk.logic.stepNext}
              </button>
              <button
                className="btn-ghost text-xs"
                onClick={stopStepSimulation}
                aria-label={uk.logic.stepStop}
                title={uk.logic.stepStop}
              >
                <StopCircle className="w-4 h-4" />{uk.logic.stepStop}
              </button>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {Math.min(stepIndex + 1, stepOrder.length)} / {stepOrder.length}
              </span>
            </>
          )}
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
            nodes={styledNodes}
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
            <GateHelpPanel
              gateType={helpGate}
              nodeId={helpNodeId ?? undefined}
              onClose={() => { setHelpGate(null); setHelpNodeId(null) }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 flex flex-col gap-4">
          <InputsPanel nodes={nodes} />

          {truthTable.length > 0 ? (
            <TruthTablePanel
              table={truthTable}
              variables={tableVars}
              expression={expression}
              dnf={dnf}
              cnf={cnf}
            />
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
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
