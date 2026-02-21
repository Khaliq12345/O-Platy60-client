<template>
  <div class="space-y-2">
    <div
      v-for="(summaries, productName) in products"
      :key="productName"
      class="px-1 space-y-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <!-- Header -->
      <div class="p-2 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">
          {{ productName }}
        </h3>
      </div>

      <!-- Days Carousel -->
      <UCarousel
        v-slot="{ item: day, index: idx }"
        :items="days"
        :ui="{ item: 'basis-1/1 px-1', container: 'gap-2 py-2' }"
        arrows
      >
        <UPageCard class="w-[70%] mx-auto">
          <template #title>
            <span class="text-primary font-semibold">
              {{ formatDayFull(day) }}
            </span>
          </template>

          <template #description>
            <div class="mt-2 space-y-2">
              <!-- Métriques avec séparateurs -->
              <div
                v-for="(metric, mIndex) in mobileMetrics"
                :key="metric.key"
                class="py-2"
                :class="[
                  metric.bgClass,
                  mIndex > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''
                ]"
              >
                <div v-if="metric.key === 'sale'" class="space-y-2">
                  <div :class="['text-xs', metric.labelClass]">{{ metric.label }}</div>
                  <UInputNumber
                    v-model.number="saleInputs[productName][idx]"
                    :min="0"
                    size="lg"
                    class="w-full"
                    @blur="handleUpdateSale(productName, idx)"
                  />
                </div>
                <div v-else class="flex justify-between">
                  <span :class="['text-xs', metric.labelClass]">{{ metric.label }}</span>
                  <span :class="metric.valueClass">
                    {{ getMetric(productName, day, metric.metricKey) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </UPageCard>
      </UCarousel>
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
  formatDayFull,
  getMetric,
  updateSale,
} = useInventoryLogic({
  products: productsRef,
  days: daysRef,
});

// Configuration des métriques mobile
const mobileMetrics = [
  {
    key: 'initial',
    label: 'Stock Initial',
    metricKey: 'initial_portion',
    labelClass: 'text-gray-400',
    valueClass: '',
    bgClass: '',
  },
  {
    key: 'entry',
    label: 'Entrées',
    metricKey: 'entry',
    labelClass: 'text-gray-400',
    valueClass: '',
    bgClass: '',
  },
  {
    key: 'final',
    label: 'Stock Final',
    metricKey: 'final_portion',
    labelClass: 'text-blue-400',
    valueClass: 'text-blue-600',
    bgClass: '',
  },
  {
    key: 'sale',
    label: 'Sortie',
    metricKey: 'sale',
    labelClass: 'text-primary',
    valueClass: '',
    bgClass: '',
  },
  {
    key: 'remaining',
    label: 'Restant',
    metricKey: 'remaining',
    labelClass: 'text-green-400',
    valueClass: 'text-green-600',
    bgClass: '',
  },
];

function handleUpdateSale(productName: string, dayIndex: number) {
  updateSale(productName, dayIndex, put, toast);
}
</script>