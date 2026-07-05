import { useEffect, useState, type FormEvent } from 'react'
import { api, type EmailConfig, type TelegramStatus } from '../api/client'
import { Alert, Badge, PageTitle, ZohoCard, ZohoInput } from '../components/ui/ZohoUI'

export default function SettingsPage() {
  const [emailCfg, setEmailCfg] = useState<EmailConfig | null>(null)
  const [telegram, setTelegram] = useState<TelegramStatus | null>(null)
  const [teamEmail, setTeamEmail] = useState('')
  const [chatId, setChatId] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [msg, setMsg] = useState('')
  const [msgTone, setMsgTone] = useState<'success' | 'error'>('success')

  function load() {
    api.get<EmailConfig>('/email/config').then((r) => { setEmailCfg(r.data); setTeamEmail(r.data.team_email || '') })
    api.get<TelegramStatus>('/telegram/status').then((r) => { setTelegram(r.data); setChatId(r.data.chat_id || ''); setInviteLink(r.data.invite_link || '') })
  }
  useEffect(() => { load() }, [])

  async function saveEmail(e: FormEvent) {
    e.preventDefault()
    await api.put('/email/config', { team_email: teamEmail, notifications_enabled: true })
    setMsg('Email settings saved.'); setMsgTone('success'); load()
  }

  async function saveTelegram(e: FormEvent) {
    e.preventDefault()
    await api.post('/telegram/register', { chat_id: chatId, invite_link: inviteLink || null })
    setMsg('Telegram settings saved.'); setMsgTone('success'); load()
  }

  async function testEmail() {
    const { data } = await api.post<{ sent: boolean; message: string }>('/email/test')
    setMsg(data.message); setMsgTone(data.sent ? 'success' : 'error')
  }

  return (
    <div>
      <PageTitle title="Setup" subtitle="Configure email notifications and Telegram integration." />
      {msg && <Alert message={msg} tone={msgTone} />}
      <div className="grid lg:grid-cols-2 gap-6">
        <ZohoCard className="p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold">Email Notifications</h2>
            <Badge tone={emailCfg?.smtp_configured ? 'green' : 'amber'}>{emailCfg?.smtp_configured ? 'Ready' : 'Off'}</Badge>
          </div>
          <form onSubmit={saveEmail} className="space-y-4">
            <ZohoInput label="Team email" type="email" required value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} />
            <div className="flex gap-2">
              <button type="submit" className="btn-zoho flex-1">Save</button>
              <button type="button" onClick={testEmail} className="btn-zoho-secondary">Test</button>
            </div>
          </form>
        </ZohoCard>
        <ZohoCard className="p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold">Telegram Bot</h2>
            <Badge tone={telegram?.connected ? 'green' : 'gray'}>{telegram?.connected ? 'Connected' : 'Not linked'}</Badge>
          </div>
          <form onSubmit={saveTelegram} className="space-y-4">
            <ZohoInput label="Group chat ID" required value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890" />
            <ZohoInput label="Invite link" value={inviteLink} onChange={(e) => setInviteLink(e.target.value)} />
            <button type="submit" className="w-full btn-zoho">Save Telegram</button>
          </form>
        </ZohoCard>
      </div>
    </div>
  )
}
