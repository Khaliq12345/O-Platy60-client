<template>
  <div class="p-1 flex flex-col justify-between h-full min-w-[60%] mx-auto">
    <div class="mb-2 space-y-4">
      <CategoryListHeader :categories-count="query.total" />

      <CategoryAdd @added="loadCategories" />

      <div class="md:px-4 flex items-center gap-2 mb-2">
        <UInput
          v-model="searchQuery"
          name="Search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher une catégorie..."
          class="flex-1"
          @keyup.enter="applyFilter"
        />
        <UButton icon="i-heroicons-magnifying-glass" @click="applyFilter" />
      </div>
    </div>

    <Loading v-if="loading" />

    <!-- // THe listing of the categories -->
    <UPageList v-else class="grow md:px-4">
      <UPageCard v-for="category in categories" :key="category.id" class="mb-4">
        <div class="flex items-center justify-between w-full">
          <span class="font-medium text-gray-900 dark:text-white">
            {{ category.name }}
          </span>

          <!-- // Action buttons for each category -->
          <div class="flex items-center gap-1">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              size="xs"
              @click="openEditModal(category)"
            />

            <DeleteConfirm
              :item-name="category.name"
              :item-id="category.id"
              api-endpoint="/categories"
              title="Supprimer la catégorie"
              message="Les produits associés ne seront plus catégorisés."
              @deleted="loadCategories"
            >
              <template #trigger>
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  size="xs"
                />
              </template>
            </DeleteConfirm>
          </div>
        </div>
      </UPageCard>

      <!-- Display this if no category is found -->
      <div
        v-if="categories.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Aucune catégorie trouvée
      </div>
    </UPageList>

    <!-- Pagination section -->
    <LimitPagination
      :page="query.page"
      :limit="query.limit"
      :total="query.total"
      @change-page="
        (val: number) => {
          query.page = val;
          loadCategories();
        }
      "
      @change-limit="
        (val: any) => {
          query.limit = val.limit;
          query.page = val.page;
          loadCategories();
        }
      "
    />

    <!-- This is the popup modal to edit the category -->
    <CategoryEdit
      v-model:open="isEditModalOpen"
      :category="selectedCategory"
      @updated="loadCategories"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";

const { get } = useApi();

const categories = ref<Category[]>([]);
const loading = ref(true);
const query = ref({
  page: 1,
  limit: 20,
  total: 100,
  search: "",
});

const searchQuery = ref("");
const isEditModalOpen = ref(false);
const selectedCategory = ref<Category | null>(null);

async function loadCategories() {
  loading.value = true;
  interface ApiResponse {
    categories: Category[];
    count: number;
  }
  try {
    const response = await get<ApiResponse>("/categories", {
      page: query.value.page,
      limit: query.value.limit,
      search: query.value.search,
    });
    categories.value = response.categories;
    query.value.total = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

function applyFilter() {
  query.value.search = searchQuery.value;
  query.value.page = 1;
  loadCategories();
}

function openEditModal(category: Category) {
  selectedCategory.value = category;
  isEditModalOpen.value = true;
}

onMounted(() => {
  loadCategories();
});
</script>
