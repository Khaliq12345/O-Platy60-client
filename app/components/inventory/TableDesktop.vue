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

        <!-- Stock Initial -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Stock Initial</div>
          <div
            v-for="day in days"
            :key="day"
            class="text-center text-sm"
          >
            {{ getMetric(productName, day, 'initial_portion') }}
          </div>
        </div>

        <!-- Entrées -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
          <div class="text-sm text-gray-600 dark:text-gray-400">Entrées</div>
          <div
            v-for="day in days"
            :key="day"
            class="text-center text-sm"
          >
            {{ getMetric(productName, day, 'entry') }}
          </div>
        </div>

        <!-- Stock Final -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Stock Final</div>
          <div
            v-for="day in days"
            :key="day"
            class="text-center text-sm font-medium text-blue-600"
          >
            {{ getMetric(productName, day, 'final_portion') }}
          </div>
        </div>

        <!-- Ventes -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-primary-50 dark:bg-primary-950/30 rounded-md">
          <div class="text-sm text-primary font-medium">Ventes</div>
          <div
            v-for="(day, idx) in days"
            :key="day"
            class="px-1"
          >
            <UInputNumber
              v-model="saleInputs[productName][idx]"
              :min="0"
              size="sm"
              class="w-full"
              @blur="handleUpdateSale(productName, idx)"
            />
          </div>
        </div>

        <!-- Restant -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-green-50 dark:bg-green-950/30 rounded-md">
          <div class="text-sm text-green-600 font-medium">Restant</div>
          <div
            v-for="day in days"
            :key="day"
            class="text-center text-sm font-medium text-green-700"
          >
            {{ getMetric(productName, day, 'remaining') }}
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

function handleUpdateSale(productName: string, dayIndex: number) {
  updateSale(productName, dayIndex, put, toast);
}
</script>