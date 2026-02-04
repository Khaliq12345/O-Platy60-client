<template>
  <div>
    <Header />
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Tableau de bord</h1>
      <div class="flex justify-between items-center mb-6">
        <p>Bienvenue, {{ authStore.user?.full_name || authStore.user?.email }}</p>
        <UButton @click="handleLogout" color="red" variant="outline">
          Déconnexion
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { logout } = useAuth()

async function handleLogout() {
  await logout()
}
</script>
