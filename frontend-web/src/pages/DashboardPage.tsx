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
  ]

  return (
    <div>
      <PageTitle title="Home" subtitle="Welcome back — here's your sales overview." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <ZohoCard key={s.label} className="p-5">
            <p className="text-xs font-semibold uppercase text-[#616e88]">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </ZohoCard>
        ))}
      </div>

      <ZohoCard className="p-5">
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
    </div>
  )
}
