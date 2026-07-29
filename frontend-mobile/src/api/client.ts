import axios from 'axios'
import { API_BASE } from '../theme'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

export type TokenResponse = {
  access_token: string
  user_id: number
  tenant_id: number
  role: string
  tenant_name: string
}

export type User = {
  id: number
  tenant_id: number
  name: string
  email: string
  role: string
}

export type Contact = {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  status?: string | null
  notes?: string | null
}

export type Deal = {
  id: number
  contact_id?: number | null
  stage: string
  value: number
}

export type Task = {
  id: number
  title: string
  status: string
  due_date?: string | null
}

export type DashboardData = {
  total_contacts: number
  deals_by_stage: Record<string, number>
  pending_tasks: number
  team_count?: number
  pipeline_value?: number
  won_value?: number
  recent_activity?: { kind: string; title: string; detail: string; created_at: string }[]
}

export type AppNotification = {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}
