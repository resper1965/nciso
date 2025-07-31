import { QueryClient } from '@tanstack/react-query'
import { APP_CONFIG } from './constants'

// Tipos para as políticas
interface Policy {
  id: string
  title: string
  description: string
  status: 'active' | 'draft' | 'inactive'
  version: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface CreatePolicyData {
  title: string
  description: string
  status: 'active' | 'draft' | 'inactive'
  version: string
}

interface UpdatePolicyData {
  title?: string
  description?: string
  status?: 'active' | 'draft' | 'inactive'
  version?: string
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
})

// API Client
export const apiClient = {
  baseURL: APP_CONFIG.apiUrl,
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },
  
  // Políticas
  policies: {
    list: () => this.request<Policy[]>('/v1/isms/policies'),
    create: (data: CreatePolicyData) => this.request<Policy>('/v1/isms/policies', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: UpdatePolicyData) => this.request<Policy>(`/v1/isms/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => this.request<void>(`/v1/isms/policies/${id}`, {
      method: 'DELETE'
    })
  }
} 