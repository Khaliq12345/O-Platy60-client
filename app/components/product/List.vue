<template>
  <div class="p-1 flex flex-col justify-between h-full lg:mx-auto">
    <!-- En-tête -->
    <div class="mb-2">
      <PageHeader 
        title="Produits" 
        :show-add="true" 
        @add="showAddModal = true" 
      />
      <ProductListFilters
        v-model:query="filterQuery"
        @filter="handleFilter"
        @export="handleExport"
      />
    </div>

    <Loading v-if="loading" />

    <ProductListTable
      v-else
      :products="products"
      :categories="categories"
      :ingredients="ingredients"
      class="grow"
    />

    <LimitPagination
      :page="query.page"
      :limit="query.limit"
      :total="query.total"
      @change-page="handlePageChange"
      @change-limit="handleLimitChange"
    />

    <!-- Modales -->
    <ProductAdd
      :open="showAddModal"
      @update:open="showAddModal = $event"
    />

    <ProductEdit
      :open="showEdit"
      :product="selectedProduct"
      @update:open="showEdit = $event"
      @updated="loadProducts"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Ingredient } from "~/types/ingredient";

import { loadCategories } from "~/utils/categories";
import { loadIngredients } from "~/utils/ingredients";

// Routing & API
const route = useRoute();
const router = useRouter();
const { get } = useApi();
const toast = useToast();

// Données principales
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const ingredients = ref<Ingredient[]>([]);

// État UI
const loading = ref(true);
const showAddModal = ref(false);
const showEdit = ref(false);
const selectedProduct = ref<Product | undefined>(undefined);

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
  ingredient_id: route.query.ingredient_id as string | undefined,
});

// Partage aux composants enfants
provide("categories", categories);
provide("ingredients", ingredients);

// Chargement des produits
async function loadProducts() {
  loading.value = true;
  try {

    ingredients.value = (await loadIngredients()).ingredients;
    categories.value = await loadCategories();

    const params = {
      limit: query.value.limit,
      offset: (query.value.page - 1) * query.value.limit,
      name: filterQuery.value.search,
      category: filterQuery.value.category_id,
      ingredient_id: filterQuery.value.ingredient_id,
    };

    const response = await get<{
      products: Product[];
      count: number;
    }>("/products", params);

    products.value = response.products;
    query.value.total = response.count;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les produits",
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
  loadProducts();
}

// Changement de page
function handlePageChange(newPage: number) {
  query.value.page = newPage;
  loadProducts();
}

// Changement de limite par page
function handleLimitChange(params: { limit: number; page: number }) {
  query.value.limit = params.limit;
  query.value.page = params.page;
  loadProducts();
}

// Export CSV
function handleExport() {
  console.log("Export CSV");
}

// Init
onMounted(() => {
  loadProducts();
});
</script>