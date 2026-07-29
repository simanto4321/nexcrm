import { useEffect, useState } from 'react'
import { api, type AppNotification } from '../api/client'
import { Alert, Badge, LoadingBlock, PageTitle, ZohoCard } from '../components/ui/ZohoUI'

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  function load() {
    setLoading(true)
    api.get<AppNotification[]>('/notifications')
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function markRead(id: number) {
    await api.post(`/notifications/${id}/read`)
    load()
  }

  async function markAll() {
    await api.post('/notifications/read-all')
    setMsg('All notifications marked as read.')
    load()
  }

  const unread = items.filter((n) => !n.is_read).length

  return (
    <div>
      <PageTitle
        title="Notifications"
        subtitle={`${unread} unread · CRM events from contacts, deals, tasks, and team`}
        action={
          unread > 0 ? (
            <button type="button" className="btn-zoho-secondary" onClick={markAll}>Mark all read</button>
          ) : undefined
        }
      />
      {msg && <Alert message={msg} tone="success" />}

      <ZohoCard className="overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-[#616e88]">No notifications yet. Create a contact or move a deal to see alerts here.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {items.map((n) => (
              <li key={n.id} className={`px-5 py-4 flex gap-3 items-start ${n.is_read ? 'opacity-70' : 'bg-[#338cf0]/5'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-[#313949]">{n.title}</p>
                    <Badge tone={n.type === 'deal' ? 'amber' : n.type === 'task' ? 'blue' : n.type === 'contact' ? 'green' : 'gray'}>
                      {n.type}
                    </Badge>
                    {!n.is_read && <Badge tone="red">new</Badge>}
                  </div>
                  <p className="text-sm text-[#616e88] mt-1">{n.message}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button type="button" className="text-xs btn-zoho-secondary py-1 px-2 shrink-0" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </ZohoCard>
    </div>
  )
}
