import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api/client';
const AuthContext = createContext(null);
const STORAGE_KEY = 'nexcrm_auth';
function loadStored() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function AuthProvider({
  children
}) {
  const stored = loadStored();
  const [token, setToken] = useState(stored?.token ?? null);
  const [user, setUser] = useState(stored?.user ?? null);
  const [tenantName, setTenantName] = useState(stored?.tenantName ?? null);
  const [role, setRole] = useState(stored?.role ?? null);
  useEffect(() => {
    setAuthToken(token);
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => logout());
    }
  }, [token]);
  function persist(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  function applyToken(res) {
    const nextUser = {
      id: res.user_id,
      tenant_id: res.tenant_id,
      name: '',
      email: '',
      role: res.role
    };
    setToken(res.access_token);
    setTenantName(res.tenant_name);
    setRole(res.role);
    setAuthToken(res.access_token);
    persist({
      token: res.access_token,
      user: nextUser,
      tenantName: res.tenant_name,
      role: res.role
    });
  }
  async function login(email, password, companyCode) {
    const {
      data
    } = await api.post('/auth/login', {
      email,
      password,
      company_code: companyCode
    });
    applyToken(data);
    const me = await api.get('/auth/me');
    setUser(me.data);
    persist({
      token: data.access_token,
      user: me.data,
      tenantName: data.tenant_name,
      role: data.role
    });
  }
  async function signup(payload) {
    const {
      data
    } = await api.post('/auth/signup', payload);
    applyToken(data);
    const me = await api.get('/auth/me');
    setUser(me.data);
    persist({
      token: data.access_token,
      user: me.data,
      tenantName: data.tenant_name,
      role: data.role
    });
  }
  function logout() {
    setToken(null);
    setUser(null);
    setTenantName(null);
    setRole(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }
  const value = useMemo(() => ({
    token,
    user,
    tenantName,
    role,
    login,
    signup,
    logout,
    isAdmin: role === 'tenant_admin'
  }), [token, user, tenantName, role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}