import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setAuthToken, type TokenResponse, type User } from '../api/client'

interface AuthState {
  token: string | null
  user: User | null
  tenantName: string | null
  role: string | null
  login: (email: string, password: string, companyCode: string) => Promise<void>
  signup: (payload: {
    tenant_name: string
    company_code: string
    admin_name: string
    admin_email: string
    password: string
  }) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthState | null>(null)
const STORAGE_KEY = 'nexcrm_auth'

function loadStored(): { token: string; user: User; tenantName: string; role: string } | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadStored()
  const [token, setToken] = useState<string | null>(stored?.token ?? null)
  const [user, setUser] = useState<User | null>(stored?.user ?? null)
  const [tenantName, setTenantName] = useState<string | null>(stored?.tenantName ?? null)
  const [role, setRole] = useState<string | null>(stored?.role ?? null)

  useEffect(() => {
    setAuthToken(token)
    if (token) {
      api.get<User>('/auth/me').then((r) => setUser(r.data)).catch(() => logout())
    }
  }, [token])

  function persist(next: { token: string; user: User; tenantName: string; role: string }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function applyToken(res: TokenResponse) {
    const nextUser: User = {
      id: res.user_id,
      tenant_id: res.tenant_id,
      name: '',
      email: '',
      role: res.role,
    }
    setToken(res.access_token)
    setTenantName(res.tenant_name)
    setRole(res.role)
    setAuthToken(res.access_token)
    persist({
      token: res.access_token,
      user: nextUser,
      tenantName: res.tenant_name,
      role: res.role,
    })
  }

  async function login(email: string, password: string, companyCode: string) {
    const { data } = await api.post<TokenResponse>('/auth/login', {
      email,
      password,
      company_code: companyCode,
    })
    applyToken(data)
    const me = await api.get<User>('/auth/me')
    setUser(me.data)
    persist({
      token: data.access_token,
      user: me.data,
      tenantName: data.tenant_name,
      role: data.role,
    })
  }

  async function signup(payload: {
    tenant_name: string
    company_code: string
    admin_name: string
    admin_email: string
    password: string
  }) {
    const { data } = await api.post<TokenResponse>('/auth/signup', payload)
    applyToken(data)
    const me = await api.get<User>('/auth/me')
    setUser(me.data)
    persist({
      token: data.access_token,
      user: me.data,
      tenantName: data.tenant_name,
      role: data.role,
    })
  }

  function logout() {
    setToken(null)
    setUser(null)
    setTenantName(null)
    setRole(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      tenantName,
      role,
      login,
      signup,
      logout,
      isAdmin: role === 'tenant_admin',
    }),
    [token, user, tenantName, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
