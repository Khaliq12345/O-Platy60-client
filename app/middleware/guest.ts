export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  authStore.initAuth()
  
  // If authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})