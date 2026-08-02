import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../api/client';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout';
import { Alert, Badge, PageTitle, ZohoCard, ZohoInput } from '../components/ui/ZohoUI';
import { PublicFooter, PublicNav } from '../components/layout/PublicNav';
const PLATFORM_KEY = 'nexcrm_platform_token';
const platformApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});
function money(n) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}
export default function PlatformAdminPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@nexcrm.com');
  const [password, setPassword] = useState('admin123');
  const [tenants, setTenants] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(PLATFORM_KEY));
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  useEffect(() => {
    if (!loggedIn) return;
    const token = localStorage.getItem(PLATFORM_KEY);
    if (!token) return;
    platformApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    void load();
  }, [loggedIn]);
  async function load() {
    try {
      const tRes = await platformApi.get('/platform/tenants');
      setTenants(tRes.data || []);
      try {
        const oRes = await platformApi.get('/platform/overview');
        setOverview(oRes.data);
      } catch {
        const list = tRes.data || [];
        setOverview({
          tenant_count: list.length,
          active_tenants: list.filter(t => t.status === 'active').length,
          suspended_tenants: list.filter(t => t.status === 'suspended').length,
          total_users: list.reduce((s, t) => s + (t.user_count || 0), 0),
          total_contacts: list.reduce((s, t) => s + (t.contact_count || 0), 0),
          total_deals: list.reduce((s, t) => s + (t.deal_count || 0), 0),
          total_pipeline: list.reduce((s, t) => s + (t.pipeline_value || 0), 0)
        });
      }
    } catch {
      setError('Could not load workspace database. Please sign in again.');
      setTenants([]);
      setOverview(null);
    }
  }
  async function onLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const {
        data
      } = await platformApi.post('/platform/auth/login', {
        email,
        password
      });
      localStorage.setItem(PLATFORM_KEY, data.access_token);
      platformApi.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      setLoggedIn(true);
      await load();
    } catch {
      setError('Invalid credentials.');
    }
  }
  async function toggleStatus(t) {
    const next = t.status === 'active' ? 'suspended' : 'active';
    await platformApi.patch(`/platform/tenants/${t.id}/status`, {
      status: next
    });
    await load();
  }
  function logout() {
    localStorage.removeItem(PLATFORM_KEY);
    delete platformApi.defaults.headers.common.Authorization;
    setLoggedIn(false);
    setTenants([]);
    setOverview(null);
  }
  const visible = useMemo(() => {
    if (filter === 'all') return tenants;
    return tenants.filter(t => t.status === filter);
  }, [tenants, filter]);
  if (!loggedIn) {
    return <AuthLayout title="🛡️ Platform Console" subtitle="Administrator access to manage all workspaces." footer={<AuthLink to="/login">← Team sign in</AuthLink>}>
        <form onSubmit={onLogin} className="space-y-4">
          {error && <Alert message={error} tone="error" />}
          <ZohoInput label="Admin email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <ZohoInput label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full btn-zoho py-3">Sign In</button>
        </form>
      </AuthLayout>;
  }
  const cards = [{
    label: '🏢 Workspaces',
    value: String(overview?.tenant_count ?? tenants.length)
  }, {
    label: '✅ Active',
    value: String(overview?.active_tenants ?? 0)
  }, {
    label: '👥 Users',
    value: String(overview?.total_users ?? 0)
  }, {
    label: '📇 Contacts',
    value: String(overview?.total_contacts ?? 0)
  }, {
    label: '💼 Deals',
    value: String(overview?.total_deals ?? 0)
  }, {
    label: '📈 Pipeline',
    value: money(overview?.total_pipeline ?? 0)
  }];
  return <div className="min-h-screen deep-bg text-white">
      <PublicNav />
      <div className="max-w-6xl mx-auto p-6 page-fade">
        <PageTitle title="🛡️ Platform console" subtitle="Live workspace database across every company on NexCRM." action={<div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => load()} className="btn-zoho-secondary">🔄 Refresh</button>
              <button type="button" onClick={() => nav('/login')} className="btn-zoho-secondary">🔑 Team sign in</button>
              <button type="button" onClick={logout} className="btn-zoho-secondary text-[#e42527]">Log out</button>
            </div>} />
        {error && <Alert message={error} tone="error" />}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {cards.map(c => <ZohoCard key={c.label} className="p-4">
              <p className="text-xs uppercase tracking-wide text-[#616e88] font-bold">{c.label}</p>
              <p className="text-2xl font-extrabold text-[#313949] mt-1">{c.value}</p>
            </ZohoCard>)}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[['all', 'All'], ['active', 'Active'], ['suspended', 'Suspended']].map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} className={`btn-zoho-secondary text-xs py-1.5 px-3 ${filter === key ? '!bg-[#e42527] !text-white !border-[#e42527]' : ''}`}>
              {label}
            </button>)}
        </div>

        <ZohoCard className="overflow-x-auto">
          <table className="w-full zoho-table min-w-[900px]">
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Code</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Contacts</th>
                <th>Deals</th>
                <th>Pipeline</th>
                <th>Won</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => <tr key={t.id}>
                  <td className="font-semibold">{t.name}</td>
                  <td className="font-mono text-xs">{t.company_code}</td>
                  <td className="capitalize">{t.plan}</td>
                  <td>{t.user_count ?? 0}</td>
                  <td>{t.contact_count ?? 0}</td>
                  <td>{t.deal_count ?? 0}</td>
                  <td>{money(t.pipeline_value ?? 0)}</td>
                  <td>{money(t.won_value ?? 0)}</td>
                  <td><Badge tone={t.status === 'active' ? 'green' : 'red'}>{t.status}</Badge></td>
                  <td>
                    <button type="button" onClick={() => toggleStatus(t)} className="text-xs btn-zoho-secondary py-1 px-2">
                      {t.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </ZohoCard>
      </div>
      <PublicFooter />
    </div>;
}