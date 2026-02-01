<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Transformations" />
    </template>

    <template #body>
      <Loading v-if="loading" />

      <div v-else-if="transformations.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">Aucune transformation trouvée</p>
      </div>

      <div v-else class="px-2 space-y-6 overflow-y-auto">
        <TransformationListHeader class="w-full mx-auto mb-2" />
        
        <!-- Intégration forcée avec v-model -->
        <Filters 
          v-model:searchQuery="searchQuery"
          v-model:dateRange="dateRange"
          @filter="handleFilter"
        />

        <TransformationList
          v-for="transformation in transformations"
          :key="transformation.id"
          :transformation="transformation"
          class="mx-auto w-full md:w-3/4"
        />
      </div>

      <!-- Pagination -->
      <div v-if="!loading && transformations.length > itemsPerPage" class="mt-6 flex justify-center">
        <UPagination
          v-model="currentPage"
          :page-count="itemsPerPage"
          :total="transformations.length"
        />
      </div>

      <div v-if="!loading && transformations.length > 0" class="mt-6 text-center text-sm text-gray-500">
        Page {{ currentPage }} sur {{ totalPages }} • {{ transformations.length }} résultats
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TransformationSummary } from "~/types/transformation";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const transformations = ref<TransformationSummary[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const now = today(getLocalTimeZone());
const dateRange = ref({
  start: new CalendarDate(now.year, 1, 1).toString(),
  end: now.add({ years: 1 }).toString()
});

const loadTransformations = async () => {
  try {
    loading.value = true;
    const response = await get<TransformationSummary[]>("/transformations", {
      search: searchQuery.value,
      start_date: dateRange.value.start.toString(),  // Adapte à la structure de Filters
      end_date: dateRange.value.end.toString(),
    });
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

function handleFilter() {
  loadTransformations();
  
  console.log("Filtres appliqués:", {
    search: searchQuery.value,
    dateRange: dateRange.value
  });
}

const totalPages = computed(() =>
  Math.ceil(transformations.value.length / itemsPerPage)
);

onMounted(() => {
  loadTransformations();
});
</script>