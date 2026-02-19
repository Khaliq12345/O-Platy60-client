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
      @delete="onDelete"
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

// Routing & API
const route = useRoute();
const router = useRouter();
const { get, del } = useApi();
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

// Chargement des catégories
async function loadCategories() {
  try {
    const res = await get<{ categories: Category[]; count: number }>(
      "/categories",
    );
    categories.value = res.categories;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les catégories",
      color: "error",
    });
  }
}

// Chargement des ingrédients
async function loadIngredients() {
  loading.value = true;
  try {
    const params = {
      page: query.value.page,
      limit: query.value.limit,
      ...filterQuery.value,
    };
    const response = await get<{
      ingredients: Ingredient[];
      count: number;
    }>("/ingredients", params);
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
  loadIngredients();
}

// Changement de page
function handlePageChange(newPage: number) {
  query.value.page = newPage;
  loadIngredients();
}

// Changement de limite par page
function handleLimitChange(params: { limit: number; page: number }) {
  query.value.limit = params.limit;
  query.value.page = params.page;
  loadIngredients();
}

// Export CSV
function handleExport() {
  console.log("Export CSV");
}

// Suppression d'un ingrédient
async function onDelete(item: Ingredient) {
  if (!confirm(`Supprimer "${item.name}" ?`)) return;

  try {
    await del(`/ingredients/${item.id}`);
    toast.add({
      title: "Succès",
      description: "Ingrédient supprimé",
      color: "success",
    });
    loadIngredients();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de supprimer",
      color: "error",
    });
  }
}

// Init
onMounted(() => {
  loadCategories();
  loadIngredients();
});
</script>