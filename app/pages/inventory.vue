<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Inventaires" />
    </template>

    <template #body>
      <div class="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <!-- Header avec filtres -->
        <div class="flex flex-col gap-4">
          <InventoryHeader />
          <InventoryAdd />
          
          <Filters
            v-model:searchQuery="searchQuery"
            v-model:dateRange="dateRange"
            @filter="handleFilter"
          />
        </div>

        <Loading v-if="loading" />

        <div v-else>
          <div class="space-y-4">
            <InventoryWeekSelector @select="handleWeekSelect" />
            <InventoryRow
              v-for="(item, index) in inventoryItems"
              :key="item.inventory_id"
              :item="item"
              :days="weeklyData[index]"
            />
          </div>

          <div v-if="inventoryItems.length === 0" class="text-center py-12 text-gray-500">
            Aucun inventaire trouvé
          </div>

          <LimitPagination
            :page="query.page"
            :limit="query.limit"
            :total="query.total"
            @change-page="(val: number) => { query.page = val; handleFilter(); }"
            @change-limit="(val: any) => { query.limit = val.limit; query.page = val.page; handleFilter(); }"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Inventory, InventoriesResponse } from "~/types/inventory";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const inventoryItems = ref<Inventory[]>([]);
const weeklyData = ref<DayValue[][]>([]);
const searchQuery = ref("");

const query = ref({
  page: 1,
  limit: 5,
  total: 0,
});

const now = today(getLocalTimeZone());
const dateRange = ref({
  start: new CalendarDate(now.year, 1, 1).toString(),
  end: now.add({ years: 1 }).toString(),
});

interface DayValue {
  entries: number | null;
  sales: number | null;
}

const emptyDay = (): DayValue => ({ entries: null, sales: null });
const emptyWeek = (): DayValue[] => Array(7).fill(null).map(emptyDay);

const loadInventoryData = async () => {
  try {
    loading.value = true;
    const response = await get<InventoriesResponse>("/inventories", query.value);
    const items = response?.inventories ?? [];
    inventoryItems.value = items;
    weeklyData.value = items.map(() => emptyWeek());
    query.value.total = response?.count ?? 0;
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les inventaires",
      color: "error",
    });
    inventoryItems.value = [];
    weeklyData.value = [];
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
  loadInventoryData();
}

function handleWeekSelect(week: { weekNumber: number; start: CalendarDate; end: CalendarDate }) {
  console.log('Semaine sélectionnée:', week);
  // Charger les données pour cette semaine
  // query.value.start_date = week.start.toString();
  // query.value.end_date = week.end.toString();
  // loadInventoryData();
}

onMounted(() => {
  loadInventoryData();
});
</script>