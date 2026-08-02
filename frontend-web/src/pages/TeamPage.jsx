import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, LoadingBlock, PageTitle, ZohoCard, ZohoInput, ZohoSelect } from '../components/ui/ZohoUI';
export default function TeamPage() {
  const {
    isAdmin
  } = useAuth();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState('member');
  const [msg, setMsg] = useState('');
  const [msgTone, setMsgTone] = useState('success');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales_rep'
  });
  function load() {
    setLoading(true);
    const jobs = [api.get('/team/members').then(r => setMembers(r.data))];
    if (isAdmin) {
      jobs.push(api.get('/team/invites').then(r => setInvites(r.data)).catch(() => setInvites([])));
    }
    Promise.all(jobs).finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, [isAdmin]);
  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (mode === 'member') {
        await api.post('/team/members', form);
        setMsg('Team member created. They can sign in with this email, password, and your company code.');
      } else {
        await api.post('/team/invites', {
          email: form.email,
          role: form.role
        });
        setMsg('Invite recorded. Share login credentials when ready.');
      }
      setMsgTone('success');
      setShowForm(false);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'sales_rep'
      });
      load();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setMsg(typeof detail === 'string' ? detail : 'Failed to save.');
      setMsgTone('error');
    }
  }
  async function cancelInvite(id) {
    if (!confirm('Cancel this invite?')) return;
    await api.delete(`/team/invites/${id}`);
    load();
  }
  return <div>
      <PageTitle title="Team" subtitle="Manage workspace members and pending invites." action={isAdmin ? <button type="button" className="btn-zoho" onClick={() => {
      setShowForm(!showForm);
      setMode('member');
    }}>
              {showForm ? 'Cancel' : '+ Add member'}
            </button> : undefined} />
      {msg && <Alert message={msg} tone={msgTone} />}

      {showForm && isAdmin && <ZohoCard className="p-5 mb-6">
          <div className="flex gap-2 mb-4">
            <button type="button" className={`text-xs px-3 py-1.5 rounded ${mode === 'member' ? 'btn-zoho' : 'btn-zoho-secondary'}`} onClick={() => setMode('member')}>Create user</button>
            <button type="button" className={`text-xs px-3 py-1.5 rounded ${mode === 'invite' ? 'btn-zoho' : 'btn-zoho-secondary'}`} onClick={() => setMode('invite')}>Invite email</button>
          </div>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            {mode === 'member' && <ZohoInput label="Name" required value={form.name} onChange={e => setForm({
          ...form,
          name: e.target.value
        })} />}
            <ZohoInput label="Email" type="email" required value={form.email} onChange={e => setForm({
          ...form,
          email: e.target.value
        })} />
            {mode === 'member' && <ZohoInput label="Temp password" type="password" required minLength={8} value={form.password} onChange={e => setForm({
          ...form,
          password: e.target.value
        })} />}
            <ZohoSelect label="Role" value={form.role} onChange={e => setForm({
          ...form,
          role: e.target.value
        })}>
              <option value="sales_rep">Sales rep</option>
              <option value="tenant_admin">Tenant admin</option>
            </ZohoSelect>
            <button type="submit" className="sm:col-span-2 btn-zoho py-2.5">{mode === 'member' ? 'Create member' : 'Save invite'}</button>
          </form>
        </ZohoCard>}

      <ZohoCard className="overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="font-bold text-white text-sm">Members ({members.length})</h2>
        </div>
        {loading ? <LoadingBlock /> : <table className="w-full zoho-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => <tr key={m.id}>
                  <td className="font-semibold">{m.name}</td>
                  <td className="text-[#616e88]">{m.email}</td>
                  <td>
                    <Badge tone={m.role === 'tenant_admin' ? 'red' : 'blue'}>
                      {m.role.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>)}
            </tbody>
          </table>}
      </ZohoCard>

      {isAdmin && <ZohoCard className="overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white text-sm">Pending invites ({invites.filter(i => i.status === 'pending').length})</h2>
          </div>
          {invites.length === 0 ? <p className="p-6 text-sm text-[#616e88]">No invites yet.</p> : <table className="w-full zoho-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invites.map(i => <tr key={i.id}>
                    <td>{i.email}</td>
                    <td>{i.role.replace('_', ' ')}</td>
                    <td><Badge tone={i.status === 'pending' ? 'amber' : 'green'}>{i.status}</Badge></td>
                    <td>
                      {i.status === 'pending' && <button type="button" className="text-xs text-red-600" onClick={() => cancelInvite(i.id)}>Cancel</button>}
                    </td>
                  </tr>)}
              </tbody>
            </table>}
        </ZohoCard>}
    </div>;
}