import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({ baseURL: API_BASE })

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export interface TokenResponse {
  access_token: string
  user_id: number
  tenant_id: number
  role: string
  tenant_name: string
}

export interface User {
  id: number
  tenant_id: number
  name: string
  email: string
  role: string
}

export interface Contact {
  id: number
  tenant_id: number
  name: string
  phone?: string | null
  email?: string | null
  status?: string | null
  notes?: string | null
  assigned_to?: number | null
}

export interface Deal {
  id: number
  tenant_id: number
  contact_id?: number | null
  stage: string
  value: number
}

export interface Task {
  id: number
  tenant_id: number
  assigned_to?: number | null
  title: string
  due_date?: string | null
  status: string
}

export interface ActivityItem {
  kind: string
  title: string
  detail: string
  created_at: string
  entity_id?: number | null
}

export interface DashboardData {
  total_contacts: number
  deals_by_stage: Record<string, number>
  pending_tasks: number
  team_count?: number
  pipeline_value?: number
  won_value?: number
  recent_activity?: ActivityItem[]
}

export interface EmailConfig {
  team_email: string | null
  notifications_enabled: boolean
  smtp_configured: boolean
}

export interface TelegramStatus {
  connected: boolean
  chat_id: string | null
  invite_link: string | null
  bot_configured?: boolean
  bot_username?: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TenantListItem {
  id: number
  name: string
  company_code: string
  plan: string
  status: string
  created_at: string
}

export interface TeamMember {
  id: number
  tenant_id: number
  name: string
  email: string
  role: string
  created_at: string
}

export interface TeamInvite {
  id: number
  tenant_id: number
  email: string
  role: string
  status: string
  invited_by: number | null
  created_at: string
}

export interface AppNotification {
  id: number
  tenant_id: number
  user_id: number
  title: string
  message: string
  type: string
  entity_type?: string | null
  entity_id?: number | null
  is_read: boolean
  created_at: string
}

export const DEAL_STAGES = ['new', 'contacted', 'negotiation', 'won', 'lost'] as const
