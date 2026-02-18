<template>
  <Filters
    v-model:search-query="searchQuery"
    @filter="handleFilter"
    
  >
    <template #filters>
      <div class="flex flex-col sm:flex-row gap-2 w-full">
        <USelect
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="Toutes catégories"
          class="w-full sm:w-48"
        />
        <USelect
          v-model="selectedIngredient"
          :items="ingredientOptions"
          placeholder="Tous ingrédients"
          class="w-full sm:w-48"
        />
      </div>
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
import type { Ingredient } from "~/types/ingredient";

const emit = defineEmits<{
  filter: [];
  export: [];
}>();

const searchQuery = ref("");
const selectedCategory = ref<string | undefined>(undefined);
const selectedIngredient = ref<string | undefined>(undefined);

const categories = inject<Ref<Category[]>>("categories", ref([]));
const ingredients = inject<Ref<Ingredient[]>>("ingredients", ref([]));
const query = defineModel("query");

const updateQuery = computed(() => {
  query.value = {
    search: searchQuery.value,
    category_id: selectedCategory.value,
    ingredient_id: selectedIngredient.value,
  };
  return query.value;
});

const categoryOptions = computed(() => [
  { label: "Toutes catégories", value: undefined },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);

const ingredientOptions = computed(() => [
  { label: "Tous ingrédients", value: undefined },
  ...ingredients.value.map((ing) => ({ label: ing.name, value: ing.id })),
]);

function handleFilter() {
  updateQuery.value;
  emit("filter");
}
</script>