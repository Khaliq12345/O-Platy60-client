<script setup lang="ts">
const searchQuery = defineModel<string>('searchQuery', { default: '' })
const dateStart = defineModel<string>('dateStart', { default: '' })

</script>

<template>
  <div class="mb-8 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Transformations
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Historique des transformations de stock
        </p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex flex-col sm:flex-row gap-3">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher..."
        class="sm:flex-1"
      />
      <div class="flex gap-3">
        <UInput
          v-model="dateStart"
          type="date"
          placeholder="Date début"
          class="w-full sm:w-40"
        />
      </div>
    </div>
  </div>
</template>