import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const api = axios.create({
  baseURL: API_BASE
});
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
export const DEAL_STAGES = ['new', 'contacted', 'negotiation', 'won', 'lost'];