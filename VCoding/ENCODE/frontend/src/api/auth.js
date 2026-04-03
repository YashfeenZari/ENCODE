const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed with status ${res.status}`
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return data
}

export function signupApi({ username, email, password }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export function loginApi({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

