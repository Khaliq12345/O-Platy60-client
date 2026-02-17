<template>
    <UPageCard class="border-red-200 dark:border-red-900">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900 dark:text-white">
            Se déconnecter
          </p>
          <p class="text-sm text-gray-500">Terminer la session actuelle</p>
        </div>
        <UButton
          color="error"
          variant="ghost"
          icon="i-heroicons-arrow-right-on-rectangle"
          label="Déconnexion"
          @click="$emit('logout')"
        />
      </div>
    </UPageCard>
  </template>
  
  <script setup lang="ts">
  defineEmits<{
    logout: [];
  }>();
  </script>