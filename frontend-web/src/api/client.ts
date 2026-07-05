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

export interface DashboardData {
  total_contacts: number
  deals_by_stage: Record<string, number>
  pending_tasks: number
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

export const DEAL_STAGES = ['new', 'contacted', 'negotiation', 'won', 'lost'] as const
