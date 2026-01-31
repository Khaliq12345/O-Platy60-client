<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Transformations"> </CustomDashboardNav>
    </template>
    <!-- Header connecté avec v-model -->
    <template #body>
      <Loading v-if="loading" />

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

      <div v-else class="px-2 space-y-6 overflow-y-auto">
        <TransformationListHeader class="w-full mx-auto mb-2" />
        <Filters @filter="handleFilter" />
        <TransformationList
          v-for="transformation in paginatedTransformations"
          :key="transformation.id"
          :transformation="transformation"
          class="mx-auto w-full md:w-3/4"
        />
      </div>

      <!-- Pagination NuxtUI -->
      <div
        v-if="!loading && filteredTransformations.length > itemsPerPage"
        class="mt-6 flex justify-center"
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
        class="mt-6 text-center text-sm text-gray-500"
      >
        Page {{ currentPage }} sur {{ totalPages }} •
        {{ filteredTransformations.length }} résultats
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
const now = today(getLocalTimeZone());
const dateStart = ref(new CalendarDate(now.year, 1, 1));
const dateEnd = ref(now.add({ years: 1 }));
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const loadTransformations = async () => {
  try {
    loading.value = true;
    const response = await get<TransformationSummary[]>("/transformations", {
      search: searchQuery.value,
      date_start: dateStart.value.toString(),
      date_end: dateEnd.value.toString(),
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

function handleFilter(filter: {
  search: string;
  date: { start: any; end: any };
}) {
  searchQuery.value = filter.search;
  dateStart.value = filter.date.start;
  dateEnd.value = filter.date.end;
  console.log(filter);
}

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
