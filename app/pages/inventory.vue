<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Inventaires" />
    </template>

    <template #body>
      <div class="lg:p-6 lg:space-y-6 space-y-4">
        <PageHeader 
          title="Inventaires" 
          show-add 
          @add="isAddModalOpen = true" 
        />

        <!-- Filtres avec sélecteur de date intégré -->
        <Filters 
          v-model:search-query="filterData.search"
          v-model:date-range="dateRange"
          @filter="handleFilter"
        />

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

  <InventoryAdd v-model:open="isAddModalOpen" />
</template>

<script setup lang="ts">
import { addDays, format, startOfWeek, parseISO } from "date-fns";
import { CalendarDate } from "@internationalized/date";
import type { ProductsSummary } from "~/utils/inventoryextra";

const { post } = useApi();

const loading = ref(true);
const productsData = ref<ProductsSummary>({});
const isAddModalOpen = ref(false);

const now = new Date();
const weekStart = startOfWeek(now, { weekStartsOn: 1 });
const weekEnd = addDays(weekStart, 6);

// Init avec des strings yyyy-MM-dd - Filters convertira en CalendarDate
const dateRange = ref({
  start: format(weekStart, "yyyy-MM-dd"),
  end: format(weekEnd, "yyyy-MM-dd"),
});

const filterData = reactive({ search: "" });

// Fournit weekStart pour compatibilité composants enfants
const currentWeekStart = computed(() => parseISO(dateRange.value.start));
provide("weekStart", currentWeekStart);

// Calcule les 7 jours à partir de dateRange.start
const weekDays = computed(() => {
  const start = parseISO(dateRange.value.start);
  return Array.from({ length: 7 }, (_, i) => 
    format(addDays(start, i), "yyyy-MM-dd")
  );
});

async function loadData() {
  loading.value = true;
  try {
    const response = await post<ProductsSummary>("/products/transaction/summary", {
      start_date: dateRange.value.start,
      end_date: dateRange.value.end,
      search: filterData.search,
    });
    productsData.value = response ?? {};
  } catch (error) {
    productsData.value = {};
  } finally {
    loading.value = false;
  }
}

// Quand on clique sur filtre, Filters met à jour dateRange puis émet filter
function handleFilter() {
  // dateRange a déjà été mis à jour par Filters via v-model
  loadData();
}

// Init
loadData();
</script>