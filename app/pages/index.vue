<template>
  <div>
    <Header />
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Tableau de bord</h1>
      <div class="flex justify-between items-center mb-6">
        <p>Bienvenue, {{ authStore.user?.full_name || authStore.user?.email }}</p>
        <UButton @click="logout" color="red" variant="outline">
          Déconnexion
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const config = useRuntimeConfig()

async function logout() {
  try {
    if (authStore.accessToken) {
      await $fetch('/auth/logout', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        body: { access_token: authStore.accessToken }
      })
    }
  } finally {
    authStore.clear()
    await navigateTo('/login')
  }
}
</script>
