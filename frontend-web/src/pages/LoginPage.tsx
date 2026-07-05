import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout'
import { Alert, ZohoInput } from '../components/ui/ZohoUI'

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('sara@globex.com')
  const [password, setPassword] = useState('secret123')
  const [companyCode, setCompanyCode] = useState('globex')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, companyCode)
      nav('/dashboard')
    } catch {
      setError('Invalid credentials or suspended tenant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to NexCRM"
      subtitle="Enter your email, password and company code."
      footer={
        <>
          <span className="text-[#616e88]">No account? </span>
          <AuthLink to="/signup">Get started free</AuthLink>
          <p className="mt-3 text-xs text-[#616e88]">
            <AuthLink to="/platform-admin">Platform administrator</AuthLink>
          </p>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert message={error} tone="error" />}
        <ZohoInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <ZohoInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <ZohoInput label="Company code" required value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} placeholder="globex" />
        <button type="submit" disabled={loading} className="w-full btn-zoho py-3 mt-2">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  )
}
