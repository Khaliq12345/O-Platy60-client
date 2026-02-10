<template>
  <div class="flex flex-col gap-3">
    <!-- Ligne de recherche -->
    <div class="flex items-center gap-2">
      <UInput
        v-model="searchQuery"
        name="Search"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un produit..."
        class="grow"
        @keyup.enter="handleSearch"
      />
      <UButton
        icon="i-heroicons-magnifying-glass"
        color="primary"
        @click="handleSearch"
      />
    </div>

    <!-- Sélecteur de semaine -->
    <InventoryWeekSelector @select="handleWeekSelect" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  search: [query: string];
  weekSelect: [week: { number: number; start: string; end: string }];
}>();

const searchQuery = ref('');

function handleSearch() {
  emit('search', searchQuery.value);
}

function handleWeekSelect(week: { number: number; start: string; end: string }) {
  emit('weekSelect', week);
}
</script>
