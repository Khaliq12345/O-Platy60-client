<template>
  <div class="p-1 flex flex-col justify-between h-full lg:mx-auto">
    <div>
      <PurchaseListHeader />
      <PurchaseListFilters
        v-model:search="searchQuery"
        v-model:category="selectedCategory"
        v-model:date-range="dateRange"
        @export="handleExport"
      />
    </div>

    <Loading v-if="loading" />

    <PurchaseListTable
      v-else
      :purchases="filteredPurchases"
      :categories="categories"
      @edit="handleEdit"
      @delete="handleDelete"
      class="grow"
    />

    <PurchaseListPagination
      v-model:current-page="currentPage"
      v-model:items-per-page="itemsPerPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      @update:current-page="loadPurchases()"
      @update:items-per-page="loadPurchases()"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const { get } = useApi();

const purchases = ref<PurchaseItem[]>([]);
const categories = ref<Category[]>([]);
const searchQuery = ref("");
const selectedCategory = ref<string | undefined>(undefined);

// Objet CalendarDate pour toute l'UI
const now = today(getLocalTimeZone());
const dateRange = ref({
  start: new CalendarDate(now.year, 1, 1),
  end: now.add({ years: 1 }),
});

// Computed pour l'API (conversion en string uniquement quand nécessaire)
const startDate = computed(() => dateRange.value?.start?.toString());
const endDate = computed(() => dateRange.value?.end?.toString());

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalPages = ref(1);

// Category to share among all children
provide("categories", categories);

const totalItems = ref(0);
const loading = ref(true);

const filteredPurchases = computed(() => {
  if (!searchQuery.value.trim()) return purchases.value;
  const query = searchQuery.value.toLowerCase().trim();
  return purchases.value.filter((purchase) =>
    purchase.item_name.toLowerCase().includes(query),
  );
});

async function loadCategories() {
  categories.value = await get<Category[]>("/categories");
}

async function loadPurchases() {
  loading.value = true;
  try {
    const query: Record<string, any> = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    };

    if (selectedCategory.value) {
      query.category_id = selectedCategory.value;
    }

    if (startDate.value) query.start_date = startDate.value;
    if (endDate.value) query.end_date = endDate.value;

    const response = await get<PurchaseItem[]>("/purchases", query);
    console.log(response);
    purchases.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

// Watcher sur dateRange - recharge automatiquement quand ça change
watch(
  () => dateRange.value,
  () => {
    currentPage.value = 1;
    loadPurchases();
  },
  { deep: true },
);

watch(
  () => selectedCategory.value,
  () => {
    currentPage.value = 1;
    loadPurchases();
  },
);

function handleEdit(item: PurchaseItem) {
  console.log("Edit", item);
}

function handleDelete(item: PurchaseItem) {
  console.log("Delete", item);
}

function handleExport() {
  console.log("Export CSV");
}

onMounted(() => {
  loadCategories();
  loadPurchases();
});
</script>
