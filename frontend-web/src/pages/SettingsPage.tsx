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
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    Promise.all([
      api.get<EmailConfig>('/email/config'),
      api.get<TelegramStatus>('/telegram/status'),
    ])
      .then(([emailRes, tgRes]) => {
        setEmailCfg(emailRes.data)
        setTeamEmail(emailRes.data.team_email || '')
        setTelegram(tgRes.data)
        setChatId(tgRes.data.chat_id || '')
        setInviteLink(tgRes.data.invite_link || '')
      })
      .catch(() => {
        setMsg('Could not load settings. Check you are logged in as tenant admin.')
        setMsgTone('error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function saveEmail(e: FormEvent) {
    e.preventDefault()
    try {
      await api.put('/email/config', { team_email: teamEmail, notifications_enabled: true })
      setMsg('Email settings saved.')
      setMsgTone('success')
      load()
    } catch {
      setMsg('Failed to save email settings.')
      setMsgTone('error')
    }
  }

  async function saveTelegram(e: FormEvent) {
    e.preventDefault()
    try {
      await api.post('/telegram/register', { chat_id: chatId, invite_link: inviteLink || null })
      setMsg('Telegram settings saved.')
      setMsgTone('success')
      load()
    } catch {
      setMsg('Failed to save Telegram settings.')
      setMsgTone('error')
    }
  }

  async function testEmail() {
    try {
      const { data } = await api.post<{ sent: boolean; message: string }>('/email/test')
      setMsg(data.message)
      setMsgTone(data.sent ? 'success' : 'error')
    } catch {
      setMsg('Email test failed.')
      setMsgTone('error')
    }
  }

  async function testTelegram() {
    try {
      const { data } = await api.post<{ sent: boolean; message: string }>('/telegram/test')
      setMsg(data.message)
      setMsgTone(data.sent ? 'success' : 'error')
    } catch {
      setMsg('Telegram test failed.')
      setMsgTone('error')
    }
  }

  if (loading) {
    return <div className="text-[#616e88]">Loading settings…</div>
  }

  return (
    <div>
      <PageTitle title="Setup" subtitle="Configure email notifications and Telegram integration for your tenant." />
      {msg && <Alert message={msg} tone={msgTone} />}
      <div className="grid lg:grid-cols-2 gap-6">
        <ZohoCard className="p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold">Email Notifications</h2>
            <Badge tone={emailCfg?.smtp_configured ? 'green' : 'amber'}>
              {emailCfg?.smtp_configured ? 'Ready' : 'SMTP off'}
            </Badge>
          </div>
          <p className="text-sm text-[#616e88] mb-4">
            Alerts when contacts are added, deals won/lost, or tasks assigned.
          </p>
          <form onSubmit={saveEmail} className="space-y-4">
            <ZohoInput label="Team email" type="email" required value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} placeholder="team@globex.com" />
            <div className="flex gap-2">
              <button type="submit" className="btn-zoho flex-1">Save</button>
              <button type="button" onClick={testEmail} className="btn-zoho-secondary">Test</button>
            </div>
          </form>
        </ZohoCard>
        <ZohoCard className="p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold">Telegram Bot</h2>
            <Badge tone={telegram?.connected ? 'green' : 'gray'}>
              {telegram?.connected ? 'Linked' : 'Not linked'}
            </Badge>
          </div>
          {telegram?.bot_configured && telegram.bot_username && (
            <p className="text-xs text-green-700 mb-3">Bot active: @{telegram.bot_username}</p>
          )}
          {!telegram?.bot_configured && (
            <p className="text-xs text-amber-700 mb-3">Server bot token not set — ask admin to add TELEGRAM_BOT_TOKEN.</p>
          )}
          <p className="text-sm text-[#616e88] mb-4">
            Add your bot to a group, then paste the group chat ID below.
          </p>
          <form onSubmit={saveTelegram} className="space-y-4">
            <ZohoInput label="Group chat ID" required value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890" />
            <ZohoInput label="Invite link (optional)" value={inviteLink} onChange={(e) => setInviteLink(e.target.value)} placeholder="https://t.me/your_group" />
            <div className="flex gap-2">
              <button type="submit" className="btn-zoho flex-1">Save</button>
              <button type="button" onClick={testTelegram} className="btn-zoho-secondary">Test</button>
            </div>
          </form>
        </ZohoCard>
      </div>
    </div>
  )
}
