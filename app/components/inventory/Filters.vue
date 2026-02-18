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
  </div>
</template>

<script setup lang="ts">
const filterData: any = inject("filterInfo");

const searchQuery = ref("");

function handleSearch() {
  filterData.search = searchQuery.value;
}
</script>
