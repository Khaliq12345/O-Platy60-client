<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Inventaires" />
    </template>

    <template #body>
      <div class="lg:p-6 lg:space-y-6">
        <div class="flex flex-col gap-4">
          <InventoryHeader />
          <InventoryAdd @added="loadInventories" />

          <InventoryFilters />
        </div>

        <Loading v-if="loading" />

        <div v-else>
          <div class="space-y-4">
            <InventoryRow
              v-for="item in inventoryItems"
              :key="item.inventory_id"
              :item="item"
              :days="getDaysForInventory(item.inventory_id)"
              @transaction-updated="loadInventories"
            />
          </div>

          <div
            v-if="inventoryItems.length === 0"
            class="text-center py-12 text-gray-500"
          >
            Aucun inventaire trouvé
          </div>

          <LimitPagination
            :page="query.page"
            :limit="query.limit"
            :total="query.total"
            @change-page="
              (val: number) => {
                query.page = val;
                loadInventories();
              }
            "
            @change-limit="
              (val: any) => {
                query.limit = val.limit;
                query.page = val.page;
                loadInventories();
              }
            "
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { addDays, format } from "date-fns";
import type {
  Inventory,
  InventoriesResponse,
  DayData,
  DailyTransactionSummary
} from "~/types/inventory";

const { get } = useApi();

const loading = ref(true);
const inventoryItems = ref<Inventory[]>([]);

const transactions = ref<Record<string, DailyTransactionSummary[]>>({});
const currentWeek = ref<{ start_date: string; end_date: string } | null>(null);
const query = ref({
  page: 1,
  limit: 5,
  total: 0,
  search: "",
});

const weekDays = computed((): DayData[] => {
  if (!currentWeek.value) return [];

  const days: DayData[] = [];
  const start = new Date(currentWeek.value.start_date + "T12:00:00");

  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    days.push({
      date: format(date, "yyyy-MM-dd"),
      entry: 0,
      sale: 0,
    });
  }

  return days;
});

async function loadInventories() {
  try {
    loading.value = true;
    const params: any = { ...query.value };
    if (!params.search) delete params.search;

    const response = await get<InventoriesResponse>("/inventories", params);
    console.log(response, "LOADING");
    inventoryItems.value = response?.inventories ?? [];
    query.value.total = response?.count ?? 0;
    
    for (const item of inventoryItems.value) {
      transactions.value[item.inventory_id] = item.daily_transaction_summary;
    }
  } catch (error) {
    inventoryItems.value = [];
  } finally {
    loading.value = false;
  }
}

function getDaysForInventory(inventoryId: string): DayData[] {
  const inventoryTxs = transactions.value[inventoryId] ?? [];

  return weekDays.value.map((day) => {
    const tx = inventoryTxs.find((t) => t.summary_date === day.date);

    return {
      ...day,
      entry: tx?.total_quantity ?? 0,
      sale: tx?.total_sales ?? 0,
    };
  });
}

const filterData = reactive({
  search: "",
  weekNumber: 1,
  start_date: "",
  end_date: "",
});

provide("filterInfo", filterData);

watch(
  () => filterData.start_date,
  async () => {
    console.log("Start Date Updated");
    currentWeek.value = {
      start_date: filterData.start_date,
      end_date: filterData.end_date,
    };
    await loadInventories();
  },
);

watch(
  () => filterData.search,
  async () => {
    console.log("Search updated");
    query.value.search = filterData.search;
    await loadInventories();
  },
);
</script>