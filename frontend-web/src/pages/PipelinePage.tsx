import { useEffect, useState, type FormEvent } from 'react'
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { api, DEAL_STAGES, type Contact, type Deal } from '../api/client'
import { useSearch } from '../context/SearchContext'
import { LoadingBlock, PageTitle, ZohoCard, ZohoInput, ZohoSelect } from '../components/ui/ZohoUI'

const stageHeader: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
}

export default function PipelinePage() {
  const { query } = useSearch()
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [form, setForm] = useState({ contact_id: '', value: '', stage: 'new' })
  const [msg, setMsg] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function load() {
    Promise.all([
      api.get<Deal[]>('/deals'),
      api.get<Contact[]>('/contacts'),
    ]).then(([d, c]) => {
      setDeals(d.data)
      setContacts(c.data)
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c.name]))

  const filtered = deals.filter((d) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    const name = contactMap[d.contact_id ?? 0] || ''
    return name.toLowerCase().includes(q) || String(d.value).includes(q) || d.stage.includes(q)
  })

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

  function openCreate() {
    setEditing(null)
    setForm({ contact_id: contacts[0]?.id ? String(contacts[0].id) : '', value: '5000', stage: 'new' })
    setShowForm(true)
  }

  function openEdit(deal: Deal) {
    setEditing(deal)
    setForm({
      contact_id: deal.contact_id ? String(deal.contact_id) : '',
      value: String(deal.value),
      stage: deal.stage,
    })
    setShowForm(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      contact_id: form.contact_id ? Number(form.contact_id) : null,
      value: Number(form.value) || 0,
      stage: form.stage,
    }
    try {
      if (editing) {
        await api.put(`/deals/${editing.id}`, payload)
        setMsg('Deal updated.')
      } else {
        await api.post('/deals', payload)
        setMsg('Deal created.')
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch {
      setMsg('Failed to save deal.')
    }
  }

  async function onDelete(deal: Deal) {
    if (!confirm(`Delete deal #${deal.id}?`)) return
    await api.delete(`/deals/${deal.id}`)
    load()
  }

  if (loading) return <LoadingBlock />

  return (
    <div>
      <PageTitle
        title="Deals"
        subtitle="Drag deals between pipeline stages."
        action={
          <button type="button" onClick={() => (showForm ? setShowForm(false) : openCreate())} className="btn-zoho">
            {showForm ? 'Cancel' : '+ New Deal'}
          </button>
        }
      />
      {msg && <p className="text-sm text-green-700 mb-4">{msg}</p>}

      {showForm && (
        <ZohoCard className="p-5 mb-6">
          <h3 className="font-bold mb-4">{editing ? `Edit Deal #${editing.id}` : 'Create Deal'}</h3>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-3 gap-4">
            <ZohoSelect label="Contact" value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}>
              <option value="">— None —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </ZohoSelect>
            <ZohoInput label="Value ($)" type="number" min="0" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <ZohoSelect label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {DEAL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </ZohoSelect>
            <button type="submit" className="sm:col-span-3 btn-zoho py-2.5">{editing ? 'Update' : 'Create'}</button>
          </form>
        </ZohoCard>
      )}

      <DndContext sensors={sensors} onDragStart={(e) => setActiveId(Number(e.active.id))} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              deals={filtered.filter((d) => d.stage === stage)}
              contactMap={contactMap}
              onEdit={openEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <DealCard deal={filtered.find((d) => d.id === activeId)!} contactMap={contactMap} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function StageColumn({
  stage,
  deals,
  contactMap,
  onEdit,
  onDelete,
}: {
  stage: string
  deals: Deal[]
  contactMap: Record<number, string>
  onEdit: (d: Deal) => void
  onDelete: (d: Deal) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-60 rounded-lg border bg-white ${isOver ? 'ring-2 ring-[#338cf0]' : 'border-[#e4e7ec]'}`}>
      <div className={`px-3 py-2 border-b text-xs font-bold uppercase rounded-t-lg ${stageHeader[stage]}`}>
        {stage} <span className="opacity-70">({deals.length})</span>
      </div>
      <div className="p-2 space-y-2 min-h-[300px] bg-[#fafbfc]">
        {deals.map((d) => (
          <DraggableDeal key={d.id} deal={d} contactMap={contactMap} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

function DraggableDeal({
  deal,
  contactMap,
  onEdit,
  onDelete,
}: {
  deal: Deal
  contactMap: Record<number, string>
  onEdit: (d: Deal) => void
  onDelete: (d: Deal) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, opacity: isDragging ? 0.5 : 1 } : undefined
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealCard deal={deal} contactMap={contactMap} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function DealCard({
  deal,
  contactMap,
  dragging,
  onEdit,
  onDelete,
}: {
  deal: Deal
  contactMap: Record<number, string>
  dragging?: boolean
  onEdit?: (d: Deal) => void
  onDelete?: (d: Deal) => void
}) {
  return (
    <ZohoCard className={`p-3 cursor-grab ${dragging ? 'shadow-lg ring-2 ring-[#e42527]/30' : ''}`}>
      <p className="text-xs text-[#616e88]">Deal #{deal.id}</p>
      <p className="font-bold text-[#e42527] mt-1">${deal.value.toLocaleString()}</p>
      <p className="text-xs text-[#616e88] mt-1 truncate">
        {deal.contact_id ? contactMap[deal.contact_id] || `Contact #${deal.contact_id}` : 'No contact'}
      </p>
      {onEdit && onDelete && !dragging && (
        <div className="flex gap-1 mt-2" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => onEdit(deal)} className="text-[10px] btn-zoho-secondary py-0.5 px-1.5">Edit</button>
          <button type="button" onClick={() => onDelete(deal)} className="text-[10px] text-red-600">Del</button>
        </div>
      )}
    </ZohoCard>
  )
}
