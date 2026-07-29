import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setAuthToken, type TokenResponse, type User } from '../api/client'

type AuthMode = 'tenant' | 'platform'

type AuthState = {
  token: string | null
  user: User | null
  tenantName: string | null
  role: string | null
  loading: boolean
  isAdmin: boolean
  isPlatform: boolean
  login: (email: string, password: string, companyCode: string) => Promise<void>
  signup: (payload: {
    tenant_name: string
    company_code: string
    admin_name: string
    admin_email: string
    password: string
  }) => Promise<void>
  platformLogin: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const KEY = 'nexcrm_mobile_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [mode, setMode] = useState<AuthMode>('tenant')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY)
        if (raw) {
          const saved = JSON.parse(raw) as {
            token: string
            user: User | null
            tenantName: string | null
            role: string
            mode?: AuthMode
          }
          setToken(saved.token)
          setUser(saved.user)
          setTenantName(saved.tenantName)
          setRole(saved.role)
          setMode(saved.mode || 'tenant')
          setAuthToken(saved.token)
          if ((saved.mode || 'tenant') === 'tenant') {
            try {
              const me = await api.get<User>('/auth/me')
              setUser(me.data)
            } catch {
              await clearAll()
            }
          }
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function clearAll() {
    setToken(null)
    setUser(null)
    setTenantName(null)
    setRole(null)
    setMode('tenant')
    setAuthToken(null)
    await AsyncStorage.removeItem(KEY)
  }

  async function persist(next: {
    token: string
    user: User | null
    tenantName: string | null
    role: string
    mode: AuthMode
  }) {
    setToken(next.token)
    setUser(next.user)
    setTenantName(next.tenantName)
    setRole(next.role)
    setMode(next.mode)
    setAuthToken(next.token)
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
  }

  async function login(email: string, password: string, companyCode: string) {
    const { data } = await api.post<TokenResponse>('/auth/login', {
      email,
      password,
      company_code: companyCode,
    })
    setAuthToken(data.access_token)
    const me = await api.get<User>('/auth/me')
    await persist({
      token: data.access_token,
      user: me.data,
      tenantName: data.tenant_name,
      role: data.role,
      mode: 'tenant',
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
    setAuthToken(data.access_token)
    const me = await api.get<User>('/auth/me')
    await persist({
      token: data.access_token,
      user: me.data,
      tenantName: data.tenant_name,
      role: data.role,
      mode: 'tenant',
    })
  }

  async function platformLogin(email: string, password: string) {
    const { data } = await api.post<{ access_token: string; role?: string }>('/platform/auth/login', {
      email,
      password,
    })
    await persist({
      token: data.access_token,
      user: { id: 0, tenant_id: 0, name: 'Platform Admin', email, role: 'platform_admin' },
      tenantName: 'Platform',
      role: 'platform_admin',
      mode: 'platform',
    })
  }

  async function logout() {
    await clearAll()
  }

  const value = useMemo(
    () => ({
      token,
      user,
      tenantName,
      role,
      loading,
      isAdmin: role === 'tenant_admin',
      isPlatform: mode === 'platform' || role === 'platform_admin',
      login,
      signup,
      platformLogin,
      logout,
    }),
    [token, user, tenantName, role, loading, mode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside provider')
  return ctx
}
