import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout'
import { Alert, ZohoInput } from '../components/ui/ZohoUI'

export default function SignupPage() {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ tenant_name: '', company_code: '', admin_name: '', admin_email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      nav('/dashboard')
    } catch {
      setError('Signup failed — company code may already exist.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'tenant_name', label: 'Company name' },
    { key: 'company_code', label: 'Company code' },
    { key: 'admin_name', label: 'Your name' },
    { key: 'admin_email', label: 'Work email', type: 'email' },
  ] as const

  return (
    <AuthLayout
      title="Get started with your free trial"
      subtitle="Create your tenant workspace in minutes."
      footer={<><span className="text-[#616e88]">Have an account? </span><AuthLink to="/login">Sign in</AuthLink></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert message={error} tone="error" />}
        {fields.map((f) => (
          <ZohoInput
            key={f.key}
            label={f.label}
            type={'type' in f ? f.type : 'text'}
            required
            value={form[f.key]}
            onChange={(e) => setField(f.key, e.target.value)}
          />
        ))}
        <ZohoInput label="Password" type="password" required minLength={8} value={form.password} onChange={(e) => setField('password', e.target.value)} />
        <button type="submit" disabled={loading} className="w-full btn-zoho py-3">
          {loading ? 'Creating...' : 'GET STARTED'}
        </button>
      </form>
    </AuthLayout>
  )
}
