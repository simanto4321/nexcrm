import { useEffect, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { api, DEAL_STAGES, type Deal } from '../api/client'
import { LoadingBlock, PageTitle, ZohoCard } from '../components/ui/ZohoUI'

const stageHeader: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<number | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => { api.get<Deal[]>('/deals').then((r) => { setDeals(r.data); setLoading(false) }) }, [])

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const dealId = Number(active.id)
    const newStage = String(over.id)
    if (!DEAL_STAGES.includes(newStage as (typeof DEAL_STAGES)[number])) return
    const deal = deals.find((d) => d.id === dealId)
    if (!deal || deal.stage === newStage) return
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)))
    await api.put(`/deals/${dealId}`, { stage: newStage })
  }

  if (loading) return <LoadingBlock />

  return (
    <div>
      <PageTitle title="Deals" subtitle="Drag deals between pipeline stages." />
      <DndContext sensors={sensors} onDragStart={(e) => setActiveId(Number(e.active.id))} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <StageColumn key={stage} stage={stage} deals={deals.filter((d) => d.stage === stage)} />
          ))}
        </div>
        <DragOverlay>
          {activeId ? <DealCard deal={deals.find((d) => d.id === activeId)!} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function StageColumn({ stage, deals }: { stage: string; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-56 rounded-lg border bg-white ${isOver ? 'ring-2 ring-[#338cf0]' : 'border-[#e4e7ec]'}`}>
      <div className={`px-3 py-2 border-b text-xs font-bold uppercase rounded-t-lg ${stageHeader[stage]}`}>
        {stage} <span className="opacity-70">({deals.length})</span>
      </div>
      <div className="p-2 space-y-2 min-h-[300px] bg-[#fafbfc]">
        {deals.map((d) => <DraggableDeal key={d.id} deal={d} />)}
      </div>
    </div>
  )
}

function DraggableDeal({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, opacity: isDragging ? 0.5 : 1 } : undefined
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes}><DealCard deal={deal} /></div>
}

function DealCard({ deal, dragging }: { deal: Deal; dragging?: boolean }) {
  return (
    <ZohoCard className={`p-3 cursor-grab ${dragging ? 'shadow-lg ring-2 ring-[#e42527]/30' : ''}`}>
      <p className="text-xs text-[#616e88]">Deal #{deal.id}</p>
      <p className="font-bold text-[#e42527] mt-1">${deal.value.toLocaleString()}</p>
      <p className="text-xs text-[#616e88] mt-1">Contact #{deal.contact_id ?? '—'}</p>
    </ZohoCard>
  )
}
