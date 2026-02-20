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
import { addDays, format, startOfWeek, parseISO, compareAsc } from "date-fns";
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
      search: filterData.search,
    };

    const response = await get<InventoriesResponse>("/inventories", params);
    const items = response?.inventories ?? [];
    
    // Traiter et trier les transactions par date
    const newTransactions: Record<string, DailyTransactionSummary[]> = {};
    
    for (const item of items) {
      // Récupérer les transactions et les trier par date croissante
      const rawTransactions = item.daily_transaction_summary ?? [];
      
      // Trier par summary_date croissant (du plus ancien au plus récent)
      const sortedTransactions = [...rawTransactions].sort((a, b) => {
        return compareAsc(parseISO(a.summary_date), parseISO(b.summary_date));
      });
      
      // Dédupliquer par date (garder la dernière si plusieurs pour même date)
      const txByDate = new Map<string, DailyTransactionSummary>();
      for (const tx of sortedTransactions) {
        txByDate.set(tx.summary_date, tx);
      }
      
      newTransactions[item.inventory_id] = Array.from(txByDate.values());
    }
    
    // Mettre à jour les items sans les transactions brutes
    inventoryItems.value = items.map(item => ({
      ...item,
      daily_transaction_summary: [] // On ne garde pas ici, on utilise transactions
    }));
    
    // Forcer la réactivité
    transactions.value = { ...newTransactions };
    
  } catch (error) {
    console.error("Erreur chargement inventaires:", error);
    inventoryItems.value = [];
    transactions.value = {};
  } finally {
    loading.value = false;
  }
}

// Watch week changes
watch(
  () => currentWeekStart.value,
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