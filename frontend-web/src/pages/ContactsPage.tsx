import { useEffect, useState, type FormEvent } from 'react'
import { api, type Contact } from '../api/client'
import { useSearch } from '../context/SearchContext'
import { Alert, Badge, LoadingBlock, PageTitle, ZohoCard, ZohoInput, ZohoSelect } from '../components/ui/ZohoUI'

const emptyForm = { name: '', email: '', phone: '', status: 'lead' }

export default function ContactsPage() {
  const { query } = useSearch()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [msg, setMsg] = useState('')
  const [msgTone, setMsgTone] = useState<'success' | 'error'>('success')

  function load() {
    setLoading(true)
    api.get<Contact[]>('/contacts').then((r) => { setContacts(r.data); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const filtered = contacts.filter((c) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    )
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(c: Contact) {
    setEditing(c)
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', status: c.status || 'lead' })
    setShowForm(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/contacts/${editing.id}`, form)
        setMsg('Contact updated.')
      } else {
        await api.post('/contacts', form)
        setMsg('Contact created — team notified via email/Telegram.')
      }
      setMsgTone('success')
      setForm(emptyForm)
      setShowForm(false)
      setEditing(null)
      load()
    } catch {
      setMsg('Failed to save contact.')
      setMsgTone('error')
    }
  }

  async function onDelete(c: Contact) {
    if (!confirm(`Delete contact "${c.name}"?`)) return
    try {
      await api.delete(`/contacts/${c.id}`)
      setMsg('Contact deleted.')
      setMsgTone('success')
      load()
    } catch {
      setMsg('Failed to delete contact.')
      setMsgTone('error')
    }
  }

  return (
    <div>
      <PageTitle
        title="Contacts"
        subtitle={`${filtered.length} contact${filtered.length === 1 ? '' : 's'}${query ? ` matching "${query}"` : ''}`}
        action={
          <button type="button" onClick={() => (showForm ? (setShowForm(false), setEditing(null)) : openCreate())} className="btn-zoho">
            {showForm ? 'Cancel' : '+ New Contact'}
          </button>
        }
      />
      {msg && <Alert message={msg} tone={msgTone} />}

      {showForm && (
        <ZohoCard className="p-5 mb-6">
          <h3 className="font-bold mb-4">{editing ? 'Edit Contact' : 'Create Contact'}</h3>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <ZohoInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <ZohoInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <ZohoInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <ZohoSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </ZohoSelect>
            <button type="submit" className="sm:col-span-2 btn-zoho py-2.5">{editing ? 'Update' : 'Save'}</button>
          </form>
        </ZohoCard>
      )}

      <ZohoCard className="overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-[#616e88]">No contacts found.</p>
        ) : (
          <table className="w-full zoho-table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
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
                  <td>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEdit(c)} className="text-xs btn-zoho-secondary py-1 px-2">Edit</button>
                      <button type="button" onClick={() => onDelete(c)} className="text-xs text-red-600 hover:underline py-1 px-1">Del</button>
                    </div>
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
