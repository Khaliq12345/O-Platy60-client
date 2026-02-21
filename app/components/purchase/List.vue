<template>
  <div class="p-1 flex flex-col justify-between h-full lg:mx-auto">
    <!-- En-tête -->
    <div class="mb-2">
      <PageHeader 
        title="Achats" 
        :show-add="true" 
        @add="showAddModal = true" 
      />
      
      <PurchaseListFilters
        v-model:query="filterQuery"
        @purchasefilter="handleFilter"
        @export="handleExport"
      />
    </div>

    <Loading v-if="loading" />

    <PurchaseListTable
      v-else
      :purchases="purchases"
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
  </div>
  <PurchaseAdd v-model:open="showAddModal" @reload="loadPurchases" />
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";

// Routing & API
const route = useRoute();
const router = useRouter();
const { get } = useApi();

// Données principales
const purchases = ref<PurchaseItem[]>([]);
const categories = ref<Category[]>([]);

// État UI
const loading = ref(true);
const showAddModal = ref(false);

// Filtres de pagination (page, limit, total)
const query = ref({
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 20,
  total: 100,
});

// Filtres dynamiques de recherche
const filterQuery = ref({
  search: route.query.search,
  category_id: route.query.category_id,
  ingredient: route.query.ingredient,
  start_date: route.query.start_date,
  end_date: route.query.end_date,
});

// Partage des catégories aux composants enfants
provide("categories", categories);

// Chargement des catégories
async function loadCategories() {
  const res = await get<{ categories: Category[]; count: number }>(
    "/categories"
  );
  categories.value = res.categories;
}

// Chargement des achats
async function loadPurchases() {
  loading.value = true;
  
  try {
    const response = await get<{
      purchases: PurchaseItem[];
      count: number;
    }>("/purchases", query.value);
    
    purchases.value = response.purchases;
    query.value.total = response.count;
    
  } catch (error) {
    console.error("Erreur lors du chargement des achats:", error);
  } finally {
    loading.value = false;
  }
}

// Mise à jour des filtres et reload
function handleFilter() {
  query.value = { ...query.value, ...filterQuery.value };
  router.replace({ query: query.value });
  loadPurchases();
}

// Changement de page
function handlePageChange(newPage: number) {
  query.value.page = newPage;
  handleFilter();
}

// Changement de limite par page
function handleLimitChange(params: { limit: number; page: number }) {
  query.value.limit = params.limit;
  query.value.page = params.page;
  handleFilter();
}

// Export CSV
function handleExport() {
  console.log("Export CSV");
}

// Init
onMounted(() => {
  loadCategories();
  handleFilter();
});
</script>