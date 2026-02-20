<template>
  <div class="space-y-2">
    <div
      v-for="item in items"
      :key="item.inventory_id"
      class="px-1 space-y-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <!-- Header -->
      <div class="p-2 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">
          {{ item.name }}
        </h3>
        <p class="flex items-center gap-2 mt-1 flex-wrap">
          <span class="text-xs text-gray-500">
            {{ getCurrentStock(item) }} {{ item.unit }}
          </span>
        </p>
      </div>

      <!-- Days Carousel -->
      <UCarousel
        v-slot="{ item: day, index: idx }"
        :items="days"
        :ui="{
          item: 'basis-1/1 px-1',
          container: 'gap-2 py-2',
        }"
        arrows
      >
        <UPageCard
          class="w-[70%] mx-auto"
        >
          <template #title>
            <span class="text-primary font-semibold">
              {{ formatDayFull(day.date) }}
            </span>
          </template>

          <template #description>
            <div class="space-y-3">
              <!-- Stock Initial -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400 uppercase">Stock Initial</span>
                <span class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ getInitialQuantity(item.inventory_id, day.date, idx) }}
                </span>
              </div>

              <!-- Entrées -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400 uppercase">Entrées</span>
                <span class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ getEntry(item.inventory_id, day.date) }}
                </span>
              </div>

              <!-- Sortie -->
              <div>
                <div class="text-xs text-primary uppercase mb-1">Sortie</div>
                <UInputNumber
                  v-model.number="saleInputs[item.inventory_id][idx]"
                  :min="0"
                  size="lg"
                  class="w-full"
                  color="primary"
                  placeholder="0"
                  @blur="updateSale(item, day, idx)"
                />
              </div>

              <!-- Stock Final -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-blue-400 uppercase">Stock Final</span>
                <span class="text-lg font-medium text-blue-600 dark:text-blue-400">
                  {{ calculateFinalStock(item.inventory_id, day.date, idx) }}
                </span>
              </div>

              <!-- Restant -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-green-400 uppercase">Restant</span>
                <span class="text-lg font-medium text-green-600 dark:text-green-400">
                  {{ calculateRemaining(item.inventory_id, day.date, idx) }}
                </span>
              </div>
            </div>
          </template>
        </UPageCard>
      </UCarousel>

      <!-- Summary -->
      <div class="px-4 pb-4">
        <UButton
          block
          color="neutral"
          variant="soft"
          size="sm"
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
  getCurrentStockForToday,
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

// Init sale inputs from transactions
watch(() => props.items, (newItems) => {
  syncSaleInputsForItems(newItems, props.days, props.transactions, saleInputs);
}, { immediate: true });

function formatDayFull(dateStr: string): string {
  return formatInventoryDay(dateStr, "EEE, MMM dd");
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

function getCurrentStock(item: Inventory): number {
  return getCurrentStockForToday(item, props.transactions);
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
