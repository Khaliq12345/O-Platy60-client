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

        <!-- Dynamic Rows -->
        <div
          v-for="row in rowDefinitions"
          :key="row.key"
          class="grid grid-cols-8 gap-4 py-3 px-2"
          :class="row.class"
        >
          <div :class="row.labelClass">{{ row.label }}</div>

          <template v-for="(day, idx) in days" :key="idx">
            <!-- Input row -->
            <div v-if="row.type === 'input'" class="px-1">
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

            <!-- Display row -->
            <div v-else :class="row.valueClass">
              {{ row.getValue(item.inventory_id, day.date, idx) || 0 }}
            </div>
          </template>
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
  getEntryQuantity,
  syncSaleInputsForItems,
  getInitialQuantityForDay,
  calculateFinalStockForDay,
  calculateRemainingForDay,
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

// Row configuration - add/modify rows here
const rowDefinitions = [
  {
    key: 'initial',
    label: 'Stock Initial',
    type: 'display',
    getValue: (id: string, date: string, idx: number) => getInitialQuantity(id, date, idx),
    class: '',
    labelClass: 'text-sm text-gray-600 dark:text-gray-400',
    valueClass: 'text-center text-sm text-gray-900 dark:text-gray-100',
  },
  {
    key: 'entries',
    label: 'Entrées',
    type: 'display',
    getValue: (id: string, date: string) => getEntry(id, date),
    class: 'bg-gray-50 dark:bg-gray-800/50 rounded-md',
    labelClass: 'text-sm text-gray-600 dark:text-gray-400',
    valueClass: 'text-center text-sm text-gray-900 dark:text-gray-100',
  },
  {
    key: 'final',
    label: 'Stock Final',
    type: 'display',
    getValue: (id: string, date: string, idx: number) => calculateFinalStock(id, date, idx),
    class: '',
    labelClass: 'text-sm text-gray-600 dark:text-gray-400',
    valueClass: 'text-center text-sm font-medium text-blue-600 dark:text-blue-400',
  },
  {
    key: 'sales',
    label: 'Ventes',
    type: 'input',
    class: 'bg-primary-50 dark:bg-primary-950/30 rounded-md',
    labelClass: 'text-sm text-primary dark:text-primary-400 font-medium flex items-center',
  },
  {
    key: 'remaining',
    label: 'Restant',
    type: 'display',
    getValue: (id: string, date: string, idx: number) => calculateRemaining(id, date, idx),
    class: 'bg-green-50 dark:bg-green-950/30 rounded-md',
    labelClass: 'text-sm text-green-600 dark:text-green-400 font-medium',
    valueClass: 'text-center text-sm font-medium text-green-700 dark:text-green-300',
  },
];

// Init sale inputs from transactions
watch(() => props.items, (newItems) => {
  syncSaleInputsForItems(newItems, props.days, props.transactions, saleInputs);
}, { immediate: true });

function formatDayLabel(dateStr: string): string {
  return formatInventoryDay(dateStr, "EEE dd");
}

function getEntry(inventoryId: string, date: string): number {
  return getEntryQuantity(props.transactions, inventoryId, date);
}

// Get initial quantity for the day
function getInitialQuantity(inventoryId: string, _date: string, dayIndex: number): number {
  return getInitialQuantityForDay(inventoryId, dayIndex, {
    items: props.items,
    days: props.days,
    transactions: props.transactions,
    saleInputs: saleInputs.value,
  });
}

// Calculate final stock (initial + entries - sales)
function calculateFinalStock(inventoryId: string, date: string, dayIndex: number): number {
  return calculateFinalStockForDay(inventoryId, date, dayIndex, {
    items: props.items,
    days: props.days,
    transactions: props.transactions,
    saleInputs: saleInputs.value,
  });
}

// Calculate remaining quantity
function calculateRemaining(inventoryId: string, date: string, dayIndex: number): number {
  return calculateRemainingForDay(inventoryId, date, dayIndex, {
    items: props.items,
    days: props.days,
    transactions: props.transactions,
    saleInputs: saleInputs.value,
  });
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
