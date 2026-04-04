const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`)
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`)
  }

  return data
}

export function getCoursesApi() {
  return request('/api/courses')
}

export function getCourseByIdApi(id) {
  return request(`/api/courses/${id}`)
}

