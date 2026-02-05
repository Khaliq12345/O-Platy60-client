<template>

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
