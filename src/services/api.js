// services/api.js
import axios from 'axios'

export const apiBase = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'

const api = axios.create({
  baseURL: apiBase,
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (err) => Promise.reject(err))

export function absoluteMediaUrl(path) {
  if (!path) return null
  // if already absolute, return as-is
  if (/^https?:\/\//i.test(path)) return path
  // combine base and path without double slashes
  return `${apiBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export default api
