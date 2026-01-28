<script setup lang="ts">
import type { TransformationSummary } from "~/types/transformation";

definePageMeta({
  layout: "default",
});

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const transformations = ref<TransformationSummary[]>([]);
const searchQuery = ref("");
const dateStart = ref("");
const dateEnd = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const loadTransformations = async () => {
  try {
    loading.value = true;
    const response = await get<TransformationSummary[]>("/transformations");
    transformations.value = response;
    totalItems.value = response.length;
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les transformations",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const filteredTransformations = computed(() => {
  let result = transformations.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.product_name.toLowerCase().includes(q) ||
        t.purchase_id?.toLowerCase().includes(q),
    );
  }

  if (dateStart.value) {
    const start = new Date(dateStart.value);
    result = result.filter((t) => new Date(t.transformation_date) >= start);
  }

  if (dateEnd.value) {
    const end = new Date(dateEnd.value);
    end.setHours(23, 59, 59);
    result = result.filter((t) => new Date(t.transformation_date) <= end);
  }

  return result;
});

const paginatedTransformations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransformations.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredTransformations.value.length / itemsPerPage),
);

onMounted(() => {
  loadTransformations();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 overflow-scroll">
    <!-- Header connecté avec v-model -->
    <TransformationListHeader
      v-model:search-query="searchQuery"
      v-model:date-start="dateStart"
    />

    <!-- États -->
    <div v-if="loading" class="space-y-4">
      <UCard v-for="i in 3" :key="i">
        <div class="space-y-4">
          <USkeleton class="h-8 w-32" />
          <USkeleton class="h-16 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>
      </UCard>
    </div>

    <div
      v-else-if="filteredTransformations.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-inbox"
        class="w-12 h-12 text-gray-400 mx-auto mb-3"
      />
      <p class="text-gray-500 dark:text-gray-400">
        Aucune transformation trouvée
      </p>
    </div>

    <div v-else class="space-y-4">
      <TransformationList
        v-for="transformation in paginatedTransformations"
        :key="transformation.id"
        :transformation="transformation"
      />
    </div>

    <!-- Pagination NuxtUI -->
    <div
      v-if="!loading && filteredTransformations.length > itemsPerPage"
      class="mt-8 flex justify-center"
    >
      <UPagination
        v-model="currentPage"
        :page-count="itemsPerPage"
        :total="filteredTransformations.length"
      />
    </div>

    <!-- Info pagination -->
    <div
      v-if="!loading && filteredTransformations.length > 0"
      class="mt-4 text-center text-sm text-gray-500"
    >
      Page {{ currentPage }} sur {{ totalPages }} •
      {{ filteredTransformations.length }} résultats
    </div>
  </div>
</template>
