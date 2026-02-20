<template>
  <div class="space-y-4">
    <div
      v-for="item in items"
      :key="item.inventory_id"
      class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
        <div class="w-1 h-6 bg-primary rounded-full" />
        <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
          {{ item.name }}
        </h3>
        <span class="text-gray-400 dark:text-gray-500 text-sm ml-auto">
          {{ item.unit }}
        </span>
      </div>

      <!-- Grid -->
      <div class="p-4 space-y-2 overflow-x-auto">
        <!-- Days Header -->
        <div class="grid grid-cols-8 gap-4 mb-4">
          <div class="text-xs text-gray-400 dark:text-gray-500 uppercase">Metric</div>
          <div
            v-for="day in days"
            :key="day.date"
            class="text-xs text-gray-400 dark:text-gray-500 uppercase text-center"
          >
            {{ formatDayLabel(day.date) }}
          </div>
        </div>

        <!-- Stock Initial -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Stock Initial</div>
          <div
            v-for="(day, idx) in days"
            :key="day.date"
            class="text-center text-sm text-gray-900 dark:text-gray-100"
          >
            {{ getInitialStock(item.inventory_id, idx) }}
          </div>
        </div>

        <!-- Entrées -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
          <div class="text-sm text-gray-600 dark:text-gray-400">Entrées</div>
          <div
            v-for="day in days"
            :key="day.date"
            class="text-center text-sm text-gray-900 dark:text-gray-100"
          >
            {{ getEntries(item.inventory_id, day.date) }}
          </div>
        </div>

        <!-- Stock Final -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Stock Final</div>
          <div
            v-for="(day, idx) in days"
            :key="day.date"
            class="text-center text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            {{ getFinalStock(item.inventory_id, day.date, idx) }}
          </div>
        </div>

        <!-- Ventes (Input) -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-primary-50 dark:bg-primary-950/30 rounded-md">
          <div class="text-sm text-primary dark:text-primary-400 font-medium">Ventes</div>
          <div
            v-for="(day, idx) in days"
            :key="day.date"
            class="px-1"
          >
            <UInputNumber
              v-model="saleInputs[item.inventory_id][idx]"
              :min="0"
              size="sm"
              class="w-full"
              color="primary"
              @blur="updateSale(item, day, idx)"
              @keyup.enter="updateSale(item, day, idx)"
            />
          </div>
        </div>

        <!-- Restant -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-green-50 dark:bg-green-950/30 rounded-md">
          <div class="text-sm text-green-600 dark:text-green-400 font-medium">Restant</div>
          <div
            v-for="(day, idx) in days"
            :key="day.date"
            class="text-center text-sm font-medium text-green-700 dark:text-green-300"
          >
            {{ getRemaining(item.inventory_id, day.date, idx) }}
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="px-4 pb-4">
        <UButton
          block
          color="neutral"
          variant="soft"
          :icon="openSummaries[item.inventory_id] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="toggleSummary(item.inventory_id)"
        >
          Calculer le sommaire
        </UButton>

        <InventoryDetails
          v-if="openSummaries[item.inventory_id]"
          v-model:open="openSummaries[item.inventory_id]"
          :inventory-id="item.inventory_id"
          :start-date="days[0]?.date"
          :end-date="days[6]?.date"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Inventory, DayData, DailyTransactionSummary } from "~/types/inventory";
import {
  formatInventoryDay,
  syncSaleInputsForItems,
  getEntryForDay,
  getSalesForDay,
  calculateInitialStock,
  calculateFinalStock,
  calculateRemaining,
  toggleSummaryState,
  saveInventorySale,
} from "~/utils/inventoryextra";

const props = defineProps<{
  items: Inventory[];
  days: DayData[];
  transactions: Record<string, DailyTransactionSummary[]>;
}>();

const { post } = useApi();
const toast = useToast();

const saleInputs = ref<Record<string, number[]>>({});
const openSummaries = ref<Record<string, boolean>>({});

// Watch pour synchroniser les données
watch(
  () => [props.items, props.days, props.transactions],
  () => {
    syncSaleInputsForItems(props.items, props.days, props.transactions, saleInputs);
  },
  { immediate: true, deep: true }
);

function formatDayLabel(dateStr: string): string {
  return formatInventoryDay(dateStr, "EEE dd");
}

function getItem(inventoryId: string): Inventory | undefined {
  return props.items.find(i => i.inventory_id === inventoryId);
}

function getTransactions(inventoryId: string): DailyTransactionSummary[] {
  return props.transactions[inventoryId] ?? [];
}

function getInitialStock(inventoryId: string, dayIndex: number): number {
  const item = getItem(inventoryId);
  if (!item) return 0;
  
  return calculateInitialStock(
    item,
    props.days,
    dayIndex,
    getTransactions(inventoryId)
  );
}

function getEntries(inventoryId: string, date: string): number {
  return getEntryForDay(getTransactions(inventoryId), date);
}

function getFinalStock(inventoryId: string, date: string, dayIndex: number): number {
  const initial = getInitialStock(inventoryId, dayIndex);
  const entries = getEntries(inventoryId, date);
  return calculateFinalStock(initial, entries);
}

function getRemaining(inventoryId: string, date: string, dayIndex: number): number {
  const finalStock = getFinalStock(inventoryId, date, dayIndex);
  const sales = saleInputs.value[inventoryId]?.[dayIndex] ?? 0;
  return calculateRemaining(finalStock, sales);
}

function toggleSummary(inventoryId: string) {
  toggleSummaryState(openSummaries, inventoryId);
}

async function updateSale(item: Inventory, day: DayData, index: number) {
  await saveInventorySale({
    post,
    toast,
    inventoryId: item.inventory_id,
    sale: saleInputs.value[item.inventory_id][index] ?? 0,
    createdAt: day.date,
  });
}
</script>