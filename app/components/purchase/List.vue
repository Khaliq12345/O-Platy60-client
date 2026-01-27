<template>
  <div class="p-1 lg:mx-auto">
    <PurchaseListHeader />

    <PurchaseListFilters
      :categories="categories"
      v-model:search="searchQuery"
      @update:category="
        selectedCategory = $event;
        loadPurchases();
      "
      @update:date-range="handleDateRange"
      @export="handleExport"
    />

    <PurchaseListTable
      :purchases="filteredPurchases"
      :categories="categories"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <PurchaseListPagination
      v-model:current-page="currentPage"
      v-model:items-per-page="itemsPerPage"
      :total-pages="totalPages"
      @update:current-page="loadPurchases()"
      @update:items-per-page="loadPurchases()"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";

const { get } = useApi();

const purchases = ref<PurchaseItem[]>([]);
const categories = ref<Category[]>([]);

// Filtres
const searchQuery = ref(""); // Filtre local uniquement
const selectedCategory = ref<string | undefined>(undefined);
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalPages = ref(1);

// Provide
provide("categories", categories);

// Données filtrées localement (pour la recherche par nom)
const filteredPurchases = computed(() => {
  if (!searchQuery.value.trim()) {
    return purchases.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return purchases.value.filter((purchase) =>
    purchase.item_name.toLowerCase().includes(query),
  );
});

async function loadCategories() {
  categories.value = await get<Category[]>("/categories");
}

async function loadPurchases() {
  const query: Record<string, any> = {
    page: currentPage.value,
    limit: itemsPerPage.value,
  };

  // Pas de searchQuery ici - filtre local uniquement
  if (selectedCategory.value) {
    query.category_id = selectedCategory.value;
  }

  if (startDate.value) {
    query.start_date = startDate.value;
  }

  if (endDate.value) {
    query.end_date = endDate.value;
  }

  const response = await get<PurchaseItem[]>("/purchases", query);
  purchases.value = response;
}

// Gestion de la plage de dates
function handleDateRange(start: string | undefined, end: string | undefined) {
  startDate.value = start;
  endDate.value = end;
  loadPurchases();
}

// Actions des buttons

function handleView(item: PurchaseItem) {
  console.log("View", item);
}

function handleEdit(item: PurchaseItem) {
  console.log("Edit", item);
}

function handleDelete(item: PurchaseItem) {
  console.log("Delete", item);
}

function handleExport() {
  console.log("Export CSV");
}

// When component load
onMounted(() => {
  loadCategories();
  loadPurchases();
});
</script>
