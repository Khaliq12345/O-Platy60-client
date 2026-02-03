<template>
  <Filters
    v-model:search-query="searchQuery"
    v-model:date-range="dateRange"
    @filter="
      () => {
        updateQuery;
        emit('purchasefilter');
      }
    "
  >
    <template #filters>
      <USelect
        v-model="selectedCategory"
        :items="categoryOptions"
        placeholder="Toutes catégories"
        class="w-full sm:w-48"
      />
    </template>

    <template #actions>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-down-tray"
        @click="emit('export')"
        title="Exporter CSV"
      />
    </template>

    <template #mobile-actions>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-down-tray"
        @click="emit('export')"
      />
    </template>
  </Filters>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";

const emit = defineEmits<{
  purchasefilter: [];
  export: [];
}>();

const searchQuery = ref("");
const dateRange = ref();

// Injection des catégories (même logique que FilterForm.vue)
const categories = inject<Ref<Category[]>>("categories", ref([]));
const query = defineModel("query");

const updateQuery = computed(() => {
  query.value = {
    search: searchQuery.value,
    start_date: dateRange.value.start,
    end_date: dateRange.value.end,
    category_id: selectedCategory.value,
  };
  return query.value;
});
// État local de la catégorie sélectionnée
const selectedCategory = ref<string | undefined>(undefined);

// Options du select
const categoryOptions = computed(() => [
  { label: "Toutes catégories", value: undefined },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);
</script>
