const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableError(error) {
  if (!error) return false
  if (error.name === 'AbortError') return true
  if (error.status && RETRYABLE_STATUS.has(error.status)) return true
  return /Failed to fetch|NetworkError|fetch|timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED/i.test(String(error.message || ''))
}

async function request(path, { retries = 2, timeoutMs = 12000 } = {}) {
  let lastError = null
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
      if (!res.ok) {
        const error = new Error(data?.error || `Request failed with status ${res.status}`)
        error.status = res.status
        throw error
      }

      return data
    } catch (error) {
      lastError = error
      if (attempt >= retries || !isRetryableError(error)) {
        throw error
      }
      // Render free instances may need a short warm-up period.
      await sleep(1200 * (attempt + 1))
    } finally {
      clearTimeout(timeout)
    }
  }
  throw lastError || new Error('Request failed')
}

export function getCoursesApi() {
  return request('/api/courses')
}

export function getCourseByIdApi(id) {
  return request(`/api/courses/${id}`)
}

