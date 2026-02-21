<template>
  <div class="space-y-4">
    <div
      v-for="(summaries, productName) in products"
      :key="productName"
      class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
        <div class="w-1 h-6 bg-primary rounded-full" />
        <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
          {{ productName }}
        </h3>
        <span class="text-gray-400 dark:text-gray-500 text-sm ml-auto">
          {{ summaries[0]?.unit || 'unit' }}
        </span>
      </div>

      <!-- Grid -->
      <div class="p-4 space-y-2 overflow-x-auto">
        <!-- Days Header -->
        <div class="grid grid-cols-8 gap-4 mb-4">
          <div class="text-xs text-gray-400 dark:text-gray-500 uppercase">Metric</div>
          <div
            v-for="day in days"
            :key="day"
            class="text-xs text-gray-400 dark:text-gray-500 uppercase text-center"
          >
            {{ formatDayLabel(day) }}
          </div>
        </div>

        <!-- Lignes de métriques avec séparateurs -->
        <div
          v-for="(row, index) in metricRows"
          :key="row.key"
          class="grid grid-cols-8 gap-4 py-3 px-2"
          :class="[
            row.bgClass,
            index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''
          ]"
        >
          <div :class="['text-sm', row.labelClass]">{{ row.label }}</div>
          <div
            v-for="day in days"
            :key="day"
            class="text-center text-sm"
            :class="row.valueClass"
          >
            <template v-if="row.key === 'sale'">
              <UInputNumber
                v-model="saleInputs[productName][days.indexOf(day)]"
                :min="0"
                size="sm"
                class="w-full"
                @blur="handleUpdateSale(productName, days.indexOf(day))"
              />
            </template>
            <template v-else>
              {{ getMetric(productName, day, row.metricKey) }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductsSummary } from "~/utils/inventoryextra";
import { useInventoryLogic } from "~/utils/inventoryextra";

const props = defineProps<{
  products: ProductsSummary;
  days: string[];
}>();

const { put } = useApi();
const toast = useToast();

const productsRef = computed(() => props.products);
const daysRef = computed(() => props.days);

const {
  saleInputs,
  formatDayLabel,
  getMetric,
  updateSale,
} = useInventoryLogic({
  products: productsRef,
  days: daysRef,
});

// Configuration des lignes de métriques
const metricRows = [
  {
    key: 'initial',
    label: 'Stock Initial',
    metricKey: 'initial_portion',
    labelClass: 'text-gray-600 dark:text-gray-400',
    valueClass: '',
    bgClass: '',
  },
  {
    key: 'entry',
    label: 'Entrées',
    metricKey: 'entry',
    labelClass: 'text-gray-600 dark:text-gray-400',
    valueClass: '',
    bgClass: 'bg-gray-50 dark:bg-gray-800/50 rounded-md',
  },
  {
    key: 'final',
    label: 'Stock Final',
    metricKey: 'final_portion',
    labelClass: 'text-gray-600 dark:text-gray-400',
    valueClass: 'font-medium text-blue-600',
    bgClass: '',
  },
  {
    key: 'sale',
    label: 'Ventes',
    metricKey: 'sale',
    labelClass: 'text-primary font-medium',
    valueClass: '',
    bgClass: 'bg-primary-50 dark:bg-primary-950/30 rounded-md',
  },
  {
    key: 'remaining',
    label: 'Restant',
    metricKey: 'remaining',
    labelClass: 'text-green-600 font-medium',
    valueClass: 'font-medium text-green-700',
    bgClass: 'bg-green-50 dark:bg-green-950/30 rounded-md',
  },
];

function handleUpdateSale(productName: string, dayIndex: number) {
  updateSale(productName, dayIndex, put, toast);
}
</script>