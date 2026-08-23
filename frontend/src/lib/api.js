// Dev builds fall back to the local backend; production builds fall back to
// the Render deployment defined in render.yaml. VITE_API_URL always wins, so
// ops can repoint the app without a code change.
const PROD_FALLBACK = 'https://coride-3apo.onrender.com'
const DEV_FALLBACK = 'http://localhost:8000'
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_FALLBACK : DEV_FALLBACK)
).replace(/\/+$/, '')

let isHandling401 = false

export function setToken(t) {
  if (t) localStorage.setItem('coride_token', t)
  else localStorage.removeItem('coride_token')
}

export function getToken() {
  return localStorage.getItem('coride_token')
}

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401 && !isHandling401) {
      isHandling401 = true
      setToken(null)
      localStorage.removeItem('coride_user')
      window.location.href = '/login'
    }
    throw new Error(err.detail || 'Request failed')
  }

  return res.json()
}

export const api = {
  get: (path, params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request('GET', `${path}${qs}`)
  },
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
