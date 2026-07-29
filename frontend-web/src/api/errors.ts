import axios from 'axios'

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg)
    if (err.response?.status === 409) return 'Company code already taken — choose another.'
    if (err.response?.status === 401) return 'Invalid email, password, or company code.'
    if (err.response?.status === 403) return 'This account is suspended.'
    if (!err.response) return 'Cannot reach the API — check your connection.'
  }
  return fallback
}
