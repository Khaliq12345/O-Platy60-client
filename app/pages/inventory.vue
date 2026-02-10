<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Inventaires" />
    </template>

    <template #body>
      <div class="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div class="flex flex-col gap-4">
          <InventoryHeader />
          <InventoryAdd />
          
          <InventoryFilters
            @search="handleSearch"
            @week-select="handleWeekSelect"
          />
        </div>

        <Loading v-if="loading" />

        <div v-else>
          <div class="space-y-4">
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
            @change-page="(val: number) => { query.page = val; loadInventoryData(); }"
            @change-limit="(val: any) => { query.limit = val.limit; query.page = val.page; loadInventoryData(); }"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Inventory, InventoriesResponse } from "~/types/inventory";

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const inventoryItems = ref<Inventory[]>([]);
const weeklyData = ref<DayValue[][]>([]);

const query = ref({
  page: 1,
  limit: 5,
  total: 0,
  search: '',
  start_date: '',
  end_date: '',
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

function handleSearch(search: string) {
  query.value.search = search;
  query.value.page = 1;
  loadInventoryData();
}

function handleWeekSelect(week: { number: number; start_date: string; end_date: string }) {
  query.value.start_date = week.start_date;
  query.value.end_date = week.end_date;
  query.value.page = 1;
  loadInventoryData();
}

onMounted(() => {
  loadInventoryData();
});
</script>
