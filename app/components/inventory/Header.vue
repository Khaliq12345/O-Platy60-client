<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Vue Hebdomadaire
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm">
        Gérez et suivez les niveaux de stock pour la semaine en cours.
      </p>
    </div>
    <UButton color="primary" icon="i-lucide-plus" @click="isOpen = true">
      Ajouter
    </UButton>
  </div>

  <InventoryAdd v-model:open="isOpen" />
</template>

<script setup>
const isOpen = ref(false);
</script>
