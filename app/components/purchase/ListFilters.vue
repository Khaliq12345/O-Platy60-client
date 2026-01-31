<template>
  <div class="mb-6">
    <!-- Mobile -->
    <div class="items-center gap-3 md:hidden flex">
      <UInput
        :model-value="search"
        @update:model-value="search = $event"
        placeholder="Rechercher un article..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />

      <UDrawer
        direction="bottom"
        inset
        title="Filtres"
        description="Affinez votre recherche"
      >
        <UButton icon="i-lucide-menu" color="neutral" variant="ghost" />

        <template #content>
          <PurchaseFilterForm
            v-model:search-query="search"
            v-model:category="category"
            v-model:date-range="dateRange"
            @export="emit('export')"
          />
        </template>
      </UDrawer>
    </div>

    <!-- Desktop -->
    <div class="hidden md:block">
      <PurchaseFilterForm
        v-model:search-query="search"
        v-model:category="category"
        v-model:date-range="dateRange"
        @export="emit('export')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

// V-MODELS - Définition des types explicites
const search = defineModel<string>("search", { default: "" });
const category = defineModel<string | undefined>("category");
const dateRange = defineModel<{ start: CalendarDate; end: CalendarDate }>(
  "dateRange",
  {
    required: true,
  },
);

const emit = defineEmits<{
  export: [];
}>();
</script>
