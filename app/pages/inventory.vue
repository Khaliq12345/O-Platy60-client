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
          v-else-if="inventoryItems.length > 0"
          :items="inventoryItems"
          :days="weekDays"
          :transactions="transactions"
        />

        <InventoryEmptyState v-else />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { addDays, format, startOfWeek } from "date-fns";
import type {
  Inventory,
  InventoriesResponse,
  DayData,
  DailyTransactionSummary,
} from "~/types/inventory";

const { get } = useApi();

// Reactive state
const loading = ref(true);
const inventoryItems = ref<Inventory[]>([]);
const transactions = ref<Record<string, DailyTransactionSummary[]>>({});
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));
const filterData = reactive({
  search: "",
  start_date: "",
  end_date: "",
});

// Provide to child components
provide("weekStart", currentWeekStart);
provide("filterInfo", filterData);

// Generate 7 days from week start
const weekDays = computed((): DayData[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart.value, i);
    return {
      date: format(date, "yyyy-MM-dd"),
      entry: 0,
      sale: 0,
    };
  });
});

// Load inventory data from API
async function loadInventories() {
  loading.value = true;
  try {
    const params = {
      start_date: format(currentWeekStart.value, "yyyy-MM-dd"),
      end_date: format(addDays(currentWeekStart.value, 6), "yyyy-MM-dd"),
    };

    const response = await get<InventoriesResponse>("/inventories", params);
    inventoryItems.value = response?.inventories ?? [];

    // Map transactions by inventory id
    for (const item of inventoryItems.value) {
      transactions.value[item.inventory_id] =
        item.daily_transaction_summary ?? [];
    }
  } catch (error) {
    inventoryItems.value = [];
  } finally {
    loading.value = false;
  }
}

// Watch week changes
watch(
  currentWeekStart,
  () => {
    loadInventories();
  },
  { immediate: true },
);

// Watch filter changes
watch(
  () => filterData.search,
  () => {
    loadInventories();
  },
);
</script>