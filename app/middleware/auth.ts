export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  authStore.initAuth()
  
  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})