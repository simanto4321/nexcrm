import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { type TenantListItem } from '../api/client'
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout'
import { Alert, Badge, PageTitle, ZohoCard, ZohoInput } from '../components/ui/ZohoUI'
import { PublicFooter, PublicNav } from '../components/layout/PublicNav'

const PLATFORM_KEY = 'nexcrm_platform_token'
const platformApi = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

export default function PlatformAdminPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@nexcrm.com')
  const [password, setPassword] = useState('admin123')
  const [tenants, setTenants] = useState<TenantListItem[]>([])
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(PLATFORM_KEY))
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem(PLATFORM_KEY)
    if (token) {
      platformApi.defaults.headers.common.Authorization = `Bearer ${token}`
      loadTenants()
    }
  }, [])

  async function loadTenants() {
    const { data } = await platformApi.get<TenantListItem[]>('/platform/tenants')
    setTenants(data)
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await platformApi.post<{ access_token: string }>('/platform/auth/login', { email, password })
      localStorage.setItem(PLATFORM_KEY, data.access_token)
      platformApi.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
      setLoggedIn(true)
      loadTenants()
    } catch {
      setError('Invalid credentials.')
    }
  }

  async function toggleStatus(t: TenantListItem) {
    const next = t.status === 'active' ? 'suspended' : 'active'
    await platformApi.patch(`/platform/tenants/${t.id}/status`, { status: next })
    loadTenants()
  }

  function logout() {
    localStorage.removeItem(PLATFORM_KEY)
    delete platformApi.defaults.headers.common.Authorization
    setLoggedIn(false)
    setTenants([])
  }

  if (!loggedIn) {
    return (
      <AuthLayout title="Platform Console" subtitle="Super-admin access to manage all tenants." footer={<AuthLink to="/login">← Tenant sign in</AuthLink>}>
        <form onSubmit={onLogin} className="space-y-4">
          {error && <Alert message={error} tone="error" />}
          <ZohoInput label="Admin email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <ZohoInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full btn-zoho py-3">Sign In</button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <div className="min-h-screen deep-bg text-white">
      <PublicNav />
      <div className="max-w-5xl mx-auto p-6 page-fade">
        <PageTitle
          title="All Tenants"
          subtitle={`${tenants.length} workspaces on the platform.`}
          action={
            <div className="flex gap-2">
              <button type="button" onClick={() => nav('/login')} className="btn-zoho-secondary">Tenant app</button>
              <button type="button" onClick={logout} className="btn-zoho-secondary text-[#e42527]">Log out</button>
            </div>
          }
        />
        <ZohoCard className="overflow-hidden">
          <table className="w-full zoho-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Code</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold">{t.name}</td>
                  <td className="font-mono text-xs">{t.company_code}</td>
                  <td className="capitalize">{t.plan}</td>
                  <td><Badge tone={t.status === 'active' ? 'green' : 'red'}>{t.status}</Badge></td>
                  <td>
                    <button type="button" onClick={() => toggleStatus(t)} className="text-xs btn-zoho-secondary py-1 px-2">
                      {t.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ZohoCard>
      </div>
      <PublicFooter />
    </div>
  )
}
