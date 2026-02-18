<template>
  <div class="p-1 flex flex-col justify-between h-full lg:mx-auto">
    <div class="mb-2">
      <IngredientListHeader />
      <IngredientListFilters
        @filter="handleFilter"
        @export="handleExport"
        v-model:query="filterQuery"
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
      @change-page="(val: number) => {
        query.page = val;
        loadIngredients();
      }"
      @change-limit="(val: { limit: number; page: number }) => {
        query.limit = val.limit;
        query.page = val.page;
        loadIngredients();
      }"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";

const route = useRoute();
const router = useRouter();
const { get, del } = useApi();
const toast = useToast();

const ingredients = ref<Ingredient[]>([]);
const categories = ref<Category[]>([]);

provide("categories", categories);

const loading = ref(true);

const query = ref({
  page: Number(route.query.page) || 1,
  limit: Number(route.query.limit) || 20,
  total: 0,
});

const filterQuery = ref({
  search: route.query.search as string | undefined,
  category_id: route.query.category_id as string | undefined,
});

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

function handleExport() {
  console.log("Export CSV");
}

function onEdit(item: Ingredient) {
  router.push(`/ingredients/${item.id}/edit`);
}

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

onMounted(() => {
  loadCategories();
  loadIngredients();
});
</script>