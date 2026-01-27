// composables/useApi.ts

export function useApi() {
  const config = useRuntimeConfig()

  // Fonction de base pour toutes les requêtes
  async function fetch<T>(url: string, options: any = {}): Promise<T> {
    return $fetch<T>(url, {
      baseURL: config.public.apiBaseUrl,  // Ex: 'http://localhost:3000/api'
      ...options
    })
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