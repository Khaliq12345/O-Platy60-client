<script setup lang="ts">
const searchQuery = defineModel<string>("searchQuery", { default: "" });
const dateStart = defineModel<string>("dateStart", { default: "" });
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <span class="hidden md:inline">Liste des </span>
        <span class="capitalize md:lowercase">transformations</span>
      </h1>
    </div>

    <!-- Filtres -->
    <div class="flex flex-col sm:flex-row gap-3">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher..."
        class="grow"
      />
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <UInput
            v-model="dateStart"
            type="date"
            placeholder="Date début"
            class="w-full sm:w-40"
          />
        </div>
        <UButton icon="i-heroicons-funnel" />
      </div>
    </div>
  </div>
</template>
