<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Inventaires" />
    </template>

    <template #body>
      <div class="lg:p-6 lg:space-y-6 space-y-4">
        <InventoryHeader />

        <div class="grid gap-2 items-center grid-cols-1 md:grid-cols-3">
          <InventoryWeekSelector />
          <InventoryFilters class="md:col-span-2" />
        </div>

        <Loading v-if="loading" />

        <InventoryTable
          v-else-if="Object.keys(productsData).length > 0"
          :products="productsData"
          :days="weekDays"
        />

        <InventoryEmptyState v-else />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { addDays, format, startOfWeek } from "date-fns";
import type { ProductsSummary } from "~/utils/inventoryextra";

const { post } = useApi();

const loading = ref(true);
const productsData = ref<ProductsSummary>({});
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));
const filterData = reactive({ search: "" });

provide("weekStart", currentWeekStart);
provide("filterInfo", filterData);

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => 
    format(addDays(currentWeekStart.value, i), "yyyy-MM-dd")
  );
});

async function loadData() {
  loading.value = true;
  try {
    const response = await post<ProductsSummary>("/products/transaction/summary", {
      start_date: format(currentWeekStart.value, "yyyy-MM-dd"),
      end_date: format(addDays(currentWeekStart.value, 6), "yyyy-MM-dd"),
      search: filterData.search,
    });
    productsData.value = response ?? {};
  } catch (error) {
    productsData.value = {};
  } finally {
    loading.value = false;
  }
}

watch(() => currentWeekStart.value, loadData, { immediate: true });
watch(() => filterData.search, loadData);
</script>