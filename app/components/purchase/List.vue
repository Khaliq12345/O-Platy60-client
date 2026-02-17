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
      class="grow"
    />

    <LimitPagination
      :page="query.page"
      :limit="query.limit"
      :total="query.total"
      @change-page="
        (val: number) => {
          query.page = val;
          handleFilter();
        }
      "
      @change-limit="
        (val: object) => {
          (((query.limit = val.limit), (query.page = val.page)),
            handleFilter());
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";

const { get } = useApi();

const purchases = ref<PurchaseItem[]>([]);
const categories = ref<Category[]>([]);

// Category to share among all children
provide("categories", categories);

const loading = ref(true);
const query = ref({
  page: 1,
  limit: 20,
  total: 100,
});
const filterQuery = ref();

async function loadCategories() {
  const res = await get<{categories: Category[], count: number}>("/categories");
  categories.value = res.categories;
}

async function loadPurchases() {
  loading.value = true;
  interface ApiResponse {
    purchases: PurchaseItem[];
    count: number;
  }
  try {
    const response = await get<ApiResponse>("/purchases", query.value);
    purchases.value = response.purchases;
    query.value.total = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

function handleFilter() {
  query.value = { ...query.value, ...filterQuery.value };
  loadPurchases();
}

function handleExport() {
  console.log("Export CSV");
}

onMounted(() => {
  loadCategories();
  loadPurchases();
});
</script>
