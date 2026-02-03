<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Transformations" />
    </template>

    <template #body>
      <div class="h-full md:mx-auto md:w-3/4 space-y-2">
        <TransformationListHeader class="mb-2" />

        <!-- Intégration forcée avec v-model -->
        <Filters
          v-model:searchQuery="searchQuery"
          v-model:dateRange="dateRange"
          @filter="handleFilter"
        />

        <div v-if="loading" class="h-38 flex items-center justify-center">
          <Loading />
        </div>

        <div v-else-if="transformations.length === 0" class="text-center py-12">
          <UIcon
            name="i-heroicons-inbox"
            class="w-12 h-12 text-gray-400 mx-auto mb-3"
          />
          <p class="text-gray-500 dark:text-gray-400">
            Aucune transformation trouvée
          </p>
        </div>

        <TransformationList
          v-else
          v-for="transformation in transformations"
          :key="transformation.id"
          :transformation="transformation"
        />

        <!-- Pagination -->
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
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Transformation } from "~/types/transformation";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const transformations = ref<Transformation[]>([]);
const searchQuery = ref("");

const query = ref({
  page: 1,
  limit: 20,
  total: 100,
});

const now = today(getLocalTimeZone());
const dateRange = ref({
  start: new CalendarDate(now.year, 1, 1).toString(),
  end: now.add({ years: 1 }).toString(),
});

const loadTransformations = async () => {
  try {
    loading.value = true;
    const response = await get<{
      transformations: Transformation[];
      count: number;
    }>("/transformations", query.value);
    transformations.value = response.transformations;
    query.value.total = response.count;
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
  query.value = {
    ...query.value,
    search: searchQuery.value,
    start_date: dateRange.value.start,
    end_date: dateRange.value.end,
  };
  loadTransformations();
}

onMounted(() => {
  loadTransformations();
});
</script>
