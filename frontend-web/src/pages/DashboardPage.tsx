import { useEffect, useState } from 'react'
import { api, type DashboardData } from '../api/client'
import { LoadingBlock, PageTitle, ZohoCard } from '../components/ui/ZohoUI'

const stageColors: Record<string, string> = {
  new: 'border-l-blue-500',
  contacted: 'border-l-violet-500',
  negotiation: 'border-l-amber-500',
  won: 'border-l-green-500',
  lost: 'border-l-red-500',
}

function money(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then((r) => setData(r.data))
  }, [])

  if (!data) return <LoadingBlock label="Loading dashboard..." />

  const openDeals = Object.entries(data.deals_by_stage)
    .filter(([s]) => s !== 'won' && s !== 'lost')
    .reduce((a, [, n]) => a + n, 0)

  const stats = [
    { label: 'Total Contacts', value: data.total_contacts, color: 'text-[#338cf0]' },
    { label: 'Open Deals', value: openDeals, color: 'text-[#e42527]' },
    { label: 'Pending Tasks', value: data.pending_tasks, color: 'text-amber-600' },
    { label: 'Team', value: data.team_count ?? 0, color: 'text-emerald-600' },
  ]

  return (
    <div>
      <PageTitle title="Home" subtitle="Welcome back — sales overview, pipeline value, and recent activity." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <ZohoCard key={s.label} className="p-5">
            <p className="text-xs font-semibold uppercase text-[#616e88]">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </ZohoCard>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <ZohoCard className="p-5">
          <p className="text-xs font-semibold uppercase text-[#616e88]">Open pipeline value</p>
          <p className="text-3xl font-bold text-[#338cf0] mt-2">{money(data.pipeline_value ?? 0)}</p>
        </ZohoCard>
        <ZohoCard className="p-5">
          <p className="text-xs font-semibold uppercase text-[#616e88]">Won revenue</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{money(data.won_value ?? 0)}</p>
        </ZohoCard>
      </div>

      <ZohoCard className="p-5 mb-6">
        <h2 className="font-bold text-[#313949] mb-4">Deals by Stage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(data.deals_by_stage).map(([stage, count]) => (
            <div key={stage} className={`border-l-4 ${stageColors[stage] || 'border-l-gray-400'} bg-[#fafbfc] rounded-r-lg p-4`}>
              <p className="text-[10px] font-bold uppercase text-[#616e88]">{stage}</p>
              <p className="text-2xl font-bold text-[#313949] mt-1">{count}</p>
            </div>
          ))}
        </div>
      </ZohoCard>

      <ZohoCard className="p-5">
        <h2 className="font-bold text-[#313949] mb-4">Recent activity</h2>
        {!data.recent_activity?.length ? (
          <p className="text-sm text-[#616e88]">No recent activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.recent_activity.map((a, i) => (
              <li key={`${a.kind}-${a.entity_id}-${i}`} className="flex items-start gap-3 border-b border-black/5 pb-3 last:border-0">
                <span className="text-xs font-bold uppercase tracking-wide text-[#616e88] w-16 shrink-0 pt-0.5">{a.kind}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#313949] truncate">{a.title}</p>
                  <p className="text-xs text-[#616e88]">{a.detail}</p>
                </div>
                <span className="text-[11px] text-[#94a3b8] shrink-0">{new Date(a.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </ZohoCard>
    </div>
  )
}
