<template>
  <Filters @filter="handleFilter">
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
  filter: [data: { search: string; date: { start: any; end: any }; category?: string }];
  export: [];
}>();

// Injection des catégories (même logique que FilterForm.vue)
const categories = inject<Ref<Category[]>>("categories", ref([]));

// État local de la catégorie sélectionnée
const selectedCategory = ref<string | undefined>(undefined);

// Options du select
const categoryOptions = computed(() => [
  { label: "Toutes catégories", value: undefined },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);

// Réception des filtres de base (search + date) et ajout de la catégorie
const handleFilter = (filterData: { search: string; date: { start: any; end: any } }) => {
  emit("filter", {
    ...filterData,
    category_id: selectedCategory.value || "",
  });
};
</script>