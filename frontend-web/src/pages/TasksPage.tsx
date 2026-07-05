import { useEffect, useState, type FormEvent } from 'react'
import { api, type Task } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Badge, LoadingBlock, PageTitle, ZohoCard, ZohoInput } from '../components/ui/ZohoUI'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  function load() { api.get<Task[]>('/tasks').then((r) => { setTasks(r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await api.post('/tasks', { title, due_date: dueDate || null, status: 'pending', assigned_to: user?.id })
    setTitle(''); setDueDate(''); load()
  }

  async function toggleStatus(task: Task) {
    await api.put(`/tasks/${task.id}`, { status: task.status === 'done' ? 'pending' : 'done' })
    load()
  }

  return (
    <div>
      <PageTitle title="Tasks" subtitle="Track and complete your team's to-dos." />
      <ZohoCard className="p-4 mb-6">
        <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <ZohoInput label="New task" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up call..." />
          </div>
          <ZohoInput label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button type="submit" className="btn-zoho h-[42px]">Add Task</button>
        </form>
      </ZohoCard>
      {loading ? <LoadingBlock /> : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <ZohoCard key={t.id} className="p-4 flex items-center gap-4">
              <input type="checkbox" checked={t.status === 'done'} onChange={() => toggleStatus(t)} className="w-4 h-4 accent-[#e42527]" />
              <div className="flex-1">
                <p className={`font-semibold ${t.status === 'done' ? 'line-through text-[#616e88]' : 'text-[#313949]'}`}>{t.title}</p>
                <p className="text-xs text-[#616e88]">Due {t.due_date?.slice(0, 10) || '—'}</p>
              </div>
              <Badge tone={t.status === 'done' ? 'green' : 'amber'}>{t.status}</Badge>
            </ZohoCard>
          ))}
        </div>
      )}
    </div>
  )
}
