const API_ORIGIN = 'https://module-3-core-project-e-commerce-backend-production.up.railway.app';
const API_BASE_URL = import.meta.env.DEV ? '/api' : `${API_ORIGIN}/api`;

export const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('localcart-token') || '';
export const getStoredUser = () => { try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('localcart-user') || 'null'); } catch { return null; } };
export function assetUrl(value) {
  const source = String(value || '').trim();
  if (!source) return '';
  if (/^(data:|blob:|https?:\/\/)/i.test(source)) return source;
  try { return new URL(source.replace(/^\.?\//, ''), `${API_ORIGIN}/`).href; } catch { return source; }
}
export async function apiFetch(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] ||= 'application/json';
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) { const error = new Error(data.message || data.error || `Request failed (${response.status})`); error.status = response.status; error.data = data; throw error; }
  return data;
}
export const listFrom = (response, keys = []) => { if (Array.isArray(response)) return response; for (const key of keys) if (Array.isArray(response?.[key])) return response[key]; return Array.isArray(response?.data) ? response.data : []; };
export const money = (value) => `R${Number(value || 0).toFixed(2)}`;
