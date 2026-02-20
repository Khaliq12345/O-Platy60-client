<template>
  <div class="p-1 flex flex-col justify-between h-full lg:mx-auto">
    <!-- En-tête -->
    <div class="mb-2">
      <PageHeader 
        title="Ingrédients" 
        :show-add="true" 
        @add="showAddModal = true" 
      />
      <IngredientListFilters
        v-model:query="filterQuery"
        @filter="handleFilter"
        @export="handleExport"
      />
    </div>

    <Loading v-if="loading" />

    <IngredientListTable
      v-else
      :ingredients="ingredients"
      :categories="categories"
      class="grow"
    />

    <LimitPagination
      :page="query.page"
      :limit="query.limit"
      :total="query.total"
      @change-page="handlePageChange"
      @change-limit="handleLimitChange"
    />

    <!-- Modale d'ajout -->
    <IngredientAdd
      :open="showAddModal"
      @update:open="showAddModal = $event"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";
import { loadCategories } from "~/utils/categories";
import { loadIngredients as load } from "~/utils/ingredients";

// Routing & API
const route = useRoute();
const router = useRouter();
const { get } = useApi();
const toast = useToast();

// Données principales
const ingredients = ref<Ingredient[]>([]);
const categories = ref<Category[]>([]);

// État UI
const loading = ref(true);
const showAddModal = ref(false);

// Filtres de pagination
const query = ref({
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 20,
  total: 0,
});

// Filtres dynamiques
const filterQuery = ref({
  search: route.query.search as string | undefined,
  category_id: route.query.category_id as string | undefined,
});

// Partage des catégories aux composants enfants
provide("categories", categories);

// Chargement des ingrédients
async function load() {
  loading.value = true;
  try {

    categories.value = await loadCategories();

    const params = {
      page: query.value.page,
      limit: query.value.limit,
      ...filterQuery.value,
    };

    const response = await loadIngredients(params);
    ingredients.value = response.ingredients;
    query.value.total = response.count;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les ingrédients",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

// Mise à jour des filtres et reload
function handleFilter() {
  query.value.page = 1;
  const mergedQuery = {
    page: query.value.page,
    limit: query.value.limit,
    ...filterQuery.value,
  };
  router.replace({ query: mergedQuery });
  load();
}

// Changement de page
function handlePageChange(newPage: number) {
  query.value.page = newPage;
  load();
}

// Changement de limite par page
function handleLimitChange(params: { limit: number; page: number }) {
  query.value.limit = params.limit;
  query.value.page = params.page;
  load();
}

// Export CSV
function handleExport() {
  console.log("Export CSV");
}

// Init
onMounted(() => {
  load();
});
</script>