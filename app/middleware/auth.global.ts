export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  if (to.path === '/login' || to.path === '/signup') {
    if (authStore.isAuthenticated) {
      return navigateTo('/')
    }
  } else {
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  }
})