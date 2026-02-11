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
              v-for="item in inventoryItems"
              :key="item.inventory_id"
              :item="item"
              :days="getDaysForInventory(item.inventory_id)"
              @transaction-updated="reloadInventoryTransactions"
            />
          </div>

          <div v-if="inventoryItems.length === 0" class="text-center py-12 text-gray-500">
            Aucun inventaire trouvé
          </div>

          <LimitPagination
            :page="query.page"
            :limit="query.limit"
            :total="query.total"
            @change-page="(val: number) => { query.page = val; loadInventories(); }"
            @change-limit="(val: any) => { query.limit = val.limit; query.page = val.page; loadInventories(); }"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { addDays, format } from 'date-fns';
import type { 
  Inventory, 
  InventoriesResponse, 
  InventoryTransaction,
  DayData 
} from "~/types/inventory";

const { get } = useApi();

const loading = ref(true);
const inventoryItems = ref<Inventory[]>([]);
const transactions = ref<Record<string, InventoryTransaction[]>>({});
const currentWeek = ref<{ start_date: string; end_date: string } | null>(null);

const query = ref({
  page: 1,
  limit: 5,
  total: 0,
  search: '',
});

// Génère les 7 jours de la semaine à partir du start_date (lundi)
const weekDays = computed((): DayData[] => {
  if (!currentWeek.value) return [];
  
  const days: DayData[] = [];
  const start = new Date(currentWeek.value.start_date + 'T12:00:00'); // Midi pour éviter les problèmes de timezone
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    days.push({
      date: format(date, 'yyyy-MM-dd'),
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
    inventoryItems.value = response?.inventories ?? [];
    query.value.total = response?.count ?? 0;
    
    if (currentWeek.value) {
      await loadAllTransactions();
    }
  } catch (error) {
    inventoryItems.value = [];
  } finally {
    loading.value = false;
  }
};

async function loadAllTransactions() {
  if (!currentWeek.value) return;
  
  const { start_date, end_date } = currentWeek.value;
  
  for (const item of inventoryItems.value) {
    try {
      const txs = await get<InventoryTransaction[]>(
        `/inventories/${item.inventory_id}/transactions`,
        { start_date, end_date }
      );
      transactions.value[item.inventory_id] = txs ?? [];
    } catch (error) {
      transactions.value[item.inventory_id] = [];
    }
  }
};

async function reloadInventoryTransactions(inventoryId: string)  {
  if (!currentWeek.value) return;
  
  try {
    const txs = await get<InventoryTransaction[]>(
      `/inventories/${inventoryId}/transactions`,
      { 
        start_date: currentWeek.value.start_date, 
        end_date: currentWeek.value.end_date 
      }
    );
    transactions.value[inventoryId] = txs ?? [];
  } catch (error) {
    // Silencieux
  }
};

function getDaysForInventory(inventoryId: string): DayData[] {
  const inventoryTxs = transactions.value[inventoryId] ?? [];
  
  return weekDays.value.map(day => {
    // Comparer les dates sans tenir compte du timezone
    const tx = inventoryTxs.find(t => {
      const txDate = t.created_at.substring(0, 10); // "2026-02-10"
      return txDate === day.date;
    });
    
    return {
      ...day,
      entry: tx?.entry ?? 0,
      sale: tx?.sale ?? 0,
      transactionId: tx?.id,
    };
  });
};

function handleSearch(search: string) {
  query.value.search = search;
  query.value.page = 1;
  loadInventories();
};

 async function handleWeekSelect(week: { number: number; start_date: string; end_date: string }) {
  currentWeek.value = { start_date: week.start_date, end_date: week.end_date };
  await loadAllTransactions();
};

onMounted(() => {
  loadInventories();
});
</script>