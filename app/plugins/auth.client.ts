export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage on app startup
  if (process.client) {
    authStore.initAuth()
  }
})