import { useEffect, useState, type FormEvent } from 'react'
import { api, type Contact } from '../api/client'
import { Badge, LoadingBlock, PageTitle, ZohoCard, ZohoInput, ZohoSelect } from '../components/ui/ZohoUI'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'lead' })

  function load() {
    api.get<Contact[]>('/contacts').then((r) => { setContacts(r.data); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await api.post('/contacts', form)
    setForm({ name: '', email: '', phone: '', status: 'lead' })
    setShowForm(false)
    load()
  }

  return (
    <div>
      <PageTitle
        title="Contacts"
        subtitle="Manage your leads and customers."
        action={
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-zoho">
            {showForm ? 'Cancel' : '+ New Contact'}
          </button>
        }
      />

      {showForm && (
        <ZohoCard className="p-5 mb-6">
          <h3 className="font-bold mb-4">Create Contact</h3>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <ZohoInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <ZohoInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <ZohoInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <ZohoSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </ZohoSelect>
            <button type="submit" className="sm:col-span-2 btn-zoho py-2.5">Save</button>
          </form>
        </ZohoCard>
      )}

      <ZohoCard className="overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : (
          <table className="w-full zoho-table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-[#313949]">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#338cf0] text-white flex items-center justify-center text-xs font-bold">
                        {c.name.charAt(0)}
                      </span>
                      {c.name}
                    </div>
                  </td>
                  <td className="text-[#616e88]">{c.email || '—'}</td>
                  <td className="text-[#616e88]">{c.phone || '—'}</td>
                  <td>
                    <Badge tone={c.status === 'active' ? 'green' : c.status === 'lead' ? 'blue' : 'gray'}>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ZohoCard>
    </div>
  )
}
