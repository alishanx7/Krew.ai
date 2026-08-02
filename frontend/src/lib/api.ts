const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, err.detail || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    signup: (data: { email: string; password: string; full_name: string }) =>
      request<{ access_token: string; user: import('./types').User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; user: import('./types').User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: (token: string) => request<import('./types').User>('/auth/me', {}, token),
  },
  projects: {
    list: (token: string) => request<import('./types').Project[]>('/projects', {}, token),
    get: (id: string, token: string) =>
      request<import('./types').ProjectDetail>(`/projects/${id}`, {}, token),
    create: (data: object, token: string) =>
      request<import('./types').Project>('/projects', { method: 'POST', body: JSON.stringify(data) }, token),
    delete: (id: string, token: string) =>
      request<void>(`/projects/${id}`, { method: 'DELETE' }, token),
    stats: (token: string) =>
      request<import('./types').DashboardStats>('/projects/stats', {}, token),
  },
  agents: {
    generate: (projectId: string, token: string) =>
      request<{ message: string }>(`/agents/projects/${projectId}/generate`, { method: 'POST' }, token),
    agents: (projectId: string, token: string) =>
      request<import('./types').AgentRun[]>(`/agents/projects/${projectId}/agents`, {}, token),
    exportPdf: (projectId: string, token: string) => {
      const url = `${API_URL}/api/agents/projects/${projectId}/export/pdf`
      return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    },
    streamUrl: (projectId: string) => `${API_URL}/api/agents/projects/${projectId}/stream`,
  },
  documents: {
    list: (token: string) => request<import('./types').Document[]>('/documents', {}, token),
    upload: (file: File, token: string, projectId?: string) => {
      const form = new FormData()
      form.append('file', file)
      if (projectId) form.append('project_id', projectId)
      return request<import('./types').Document>('/documents/upload', { method: 'POST', body: form }, token)
    },
    delete: (id: string, token: string) =>
      request<void>(`/documents/${id}`, { method: 'DELETE' }, token),
  },
  settings: {
    updateProfile: (data: object, token: string) =>
      request<import('./types').User>('/settings/profile', { method: 'PATCH', body: JSON.stringify(data) }, token),
    updateApiKey: (key: string | null, token: string) =>
      request<import('./types').User>('/settings/api-key', {
        method: 'PATCH',
        body: JSON.stringify({ fireworks_api_key: key }),
      }, token),
  },
}

export { ApiError, API_URL }
