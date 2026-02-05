// composables/useApi.ts

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  async function refreshTokens() {
    if (!authStore.refreshToken) return false;

    try {
      const response = await $fetch<any>("/auth/refresh", {
        baseURL: config.public.apiBaseUrl,
        method: "POST",
        body: { refresh_token: authStore.refreshToken },
      });

      if (response.user) {
        authStore.set(
          response.user,
          response.access_token,
          response.refresh_token,
        );
        return true;
      }
    } catch {
      authStore.clear();
      await navigateTo("/login");
    }
    return false;
  }

  async function fetch<T>(url: string, options: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBaseUrl,
        headers,
        ...options,
      });
    } catch (error: any) {
      if (error.status === 401) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          headers.Authorization = `Bearer ${authStore.accessToken}`;
          return await $fetch<T>(url, {
            baseURL: config.public.apiBaseUrl,
            headers,
            ...options,
          });
        }
      }
      throw error;
    }
  }

  return {
    get: <T>(url: string, query?: Record<string, any>) =>
      fetch<T>(url, { method: "GET", query }),
    post: <T>(url: string, body?: any) =>
      fetch<T>(url, { method: "POST", body }),
    put: <T>(url: string, body?: any) => fetch<T>(url, { method: "PUT", body }),
    delete: <T>(url: string) => fetch<T>(url, { method: "DELETE" }),
  };
}
