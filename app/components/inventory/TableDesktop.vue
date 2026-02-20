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
            v-for="day in days"
            :key="day.date"
            class="text-center text-sm text-gray-900 dark:text-gray-100"
          >
            {{ getMetric(item.inventory_id, day.date, 'initial') }}
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
            {{ getMetric(item.inventory_id, day.date, 'entries') }}
          </div>
        </div>

        <!-- Stock Final -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Stock Final</div>
          <div
            v-for="day in days"
            :key="day.date"
            class="text-center text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            {{ getMetric(item.inventory_id, day.date, 'final') }}
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
              @blur="handleUpdateSale(item, day, idx)"
              @keyup.enter="handleUpdateSale(item, day, idx)"
            />
          </div>
        </div>

        <!-- Restant -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-green-50 dark:bg-green-950/30 rounded-md">
          <div class="text-sm text-green-600 dark:text-green-400 font-medium">Restant</div>
          <div
            v-for="day in days"
            :key="day.date"
            class="text-center text-sm font-medium text-green-700 dark:text-green-300"
          >
            {{ getMetric(item.inventory_id, day.date, 'remaining') }}
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
import { useInventoryLogic } from "~/utils/inventoryextra";

const props = defineProps<{
  items: Inventory[];
  days: DayData[];
  transactions: Record<string, DailyTransactionSummary[]>;
}>();

const { post } = useApi();
const toast = useToast();

// Convertir les props en refs pour le composable
const itemsRef = computed(() => props.items);
const daysRef = computed(() => props.days);
const transactionsRef = computed(() => props.transactions);

const {
  saleInputs,
  openSummaries,
  formatDayLabel,
  getMetric,
  toggleSummary,
  updateSale,
} = useInventoryLogic({
  items: itemsRef,
  days: daysRef,
  transactions: transactionsRef,
});

function handleUpdateSale(item: Inventory, day: DayData, index: number) {
  updateSale(item, day, index, post, toast);
}
</script>