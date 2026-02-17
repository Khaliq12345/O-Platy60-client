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

// Use this two to dynamically handle the updated of the query parameters
const route = useRoute();
const router = useRouter();

const { get } = useApi();

const purchases = ref<PurchaseItem[]>([]);
const categories = ref<Category[]>([]);

// Category to share among all children
provide("categories", categories);

const loading = ref(true);

// Contains only page and limit filters
const query = ref({
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 20,
  total: 100,
});

// Contains dynamic filters
const filterQuery = ref({
  search: route.query.search,
  category_id: route.query.category_id,
  ingredient: route.query.ingredient,
  start_date: route.query.start_date,
  end_date: route.query.end_date,
});

// Loading Categories data
async function loadCategories() {
  const res = await get<{ categories: Category[]; count: number }>(
    "/categories",
  );
  categories.value = res.categories;
}

// Loading purchases data
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
    query.value = {
      page: Number(route.query.page) || 1,
      limit: Number(route.query.limit) || 20,
      total: 100,
    };
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

// Update filters and reload purchases
function handleFilter() {
  query.value = { ...query.value, ...filterQuery.value };
  router.replace({ query: query.value });
  loadPurchases();
}

function handleExport() {
  console.log("Export CSV");
}

onMounted(() => {
  loadCategories();
  handleFilter();
});
</script>
