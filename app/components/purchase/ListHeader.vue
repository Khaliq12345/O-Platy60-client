<script setup lang="ts">
const emit = defineEmits<{
  'new-purchase': []
}>()
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
      Liste des Achats
    </h1>
    <UButton 
      color="primary" 
      label="Nouvel Achat"
      icon="i-heroicons-plus"
      @click="emit('new-purchase')"
    />
  </div>
</template>