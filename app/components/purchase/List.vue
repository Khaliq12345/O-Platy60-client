<template>
  <div class="p-1 flex flex-col justify-between h-full lg:mx-auto">
    <div class="mb-2">
      <PurchaseListHeader />
      <PurchaseListFilters
        @purchasefilter="handleFilter"
        @export="handleExport"
        v-model:query="filterQuery"
      />
    </div>

    <Loading v-if="loading" />

    <PurchaseListTable
      v-else
      :purchases="purchases"
      :categories="categories"
      @edit="handleEdit"
      @delete="handleDelete"
      class="grow"
    />

    <PurchaseListPagination
      :page="currentPage"
      :limit="query.limit"
      :total="totalItems"
      @change-page="query.page = $event"
      @change-limit="query.limit = $event"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";

const { get } = useApi();

const purchases = ref<PurchaseItem[]>([]);
const categories = ref<Category[]>([]);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalPages = ref(1);

// Category to share among all children
provide("categories", categories);

const totalItems = ref(0);
const loading = ref(true);
const query = ref({
  page: 1,
  limit: 20,
});
const filterQuery = ref();

async function loadCategories() {
  categories.value = await get<Category[]>("/categories");
}

async function loadPurchases() {
  loading.value = true;
  try {
    const response = await get<PurchaseItem[]>("/purchases", query.value);
    console.log(response);
    purchases.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

function handleFilter() {
  query.value = { ...query.value, ...filterQuery.value };
  console.log(filterQuery.value.date);
  loadPurchases();
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

onMounted(() => {
  loadCategories();
  loadPurchases();
});
</script>
