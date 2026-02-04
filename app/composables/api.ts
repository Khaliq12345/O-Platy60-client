// composables/useApi.ts

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Fonction de base pour toutes les requêtes
  async function fetch<T>(url: string, options: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Add authorization header if token exists
    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBaseUrl,
        headers,
        ...options
      })
    } catch (error: any) {
      // Handle token refresh on 401
      if (error.status === 401 && authStore.refreshToken) {
        const { refreshToken } = useAuth()
        const refreshed = await refreshToken()
        
        if (refreshed) {
          // Retry original request with new token
          headers.Authorization = `Bearer ${refreshed.access_token}`
          return await $fetch<T>(url, {
            baseURL: config.public.apiBaseUrl,
            headers,
            ...options
          })
        }
      }
      throw error
    }
  }

  return {
    // GET avec query params optionnels
    get: <T>(url: string, query?: Record<string, any>) => 
      fetch<T>(url, { method: 'GET', query }),

    // POST avec body
    post: <T>(url: string, body?: any) => 
      fetch<T>(url, { method: 'POST', body }),

    // PUT avec body  
    put: <T>(url: string, body?: any) => 
      fetch<T>(url, { method: 'PUT', body }),

    // DELETE
    delete: <T>(url: string) => 
      fetch<T>(url, { method: 'DELETE' })
  }
}