import { QueryClient } from '@tanstack/react-query'
import { APP_CONFIG } from './constants'

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
    list: () => this.request('/v1/isms/policies'),
    create: (data: any) => this.request('/v1/isms/policies', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => this.request(`/v1/isms/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => this.request(`/v1/isms/policies/${id}`, {
      method: 'DELETE'
    })
  }
} 