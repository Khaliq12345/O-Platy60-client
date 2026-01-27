<template>
  <UCard class="mb-6">
    <div class="items-center gap-3 md:hidden flex">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un article..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <UDrawer
        direction="bottom"
        inset
        title="filtres"
        description="Des filtres"
      >
        <UIcon name="i-lucide-lightbulb" class="size-5 shrink-0" />

        <template #content>
          <PurchaseFilterForm :search-query="searchQuery"></PurchaseFilterForm>
        </template>
      </UDrawer>
    </div>

    <div class="hidden md:flex">
      <PurchaseFilterForm :search-query="searchQuery"></PurchaseFilterForm>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const searchQuery = ref("");
</script>
