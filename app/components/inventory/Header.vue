<template>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Inventaire
      </h1>
      <UButton color="primary" icon="i-lucide-plus" @click="isOpen = true">
        Ajouter
      </UButton>
    </div>
  <InventoryAdd v-model:open="isOpen" />
</template>

<script setup>
const isOpen = ref(false);
</script>
