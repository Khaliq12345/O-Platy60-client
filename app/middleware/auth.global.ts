export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  if (to.path === "/login" || to.path === "/signup") {
    if (authStore.isAuthenticated) {
      return navigateTo("/");
    }
  } else {
    console.log("Auth checking, value: ", authStore.isAuthenticated);
    if (!authStore.isAuthenticated && to.path !== "/") {
      return navigateTo("/login");
    }
  }
});
