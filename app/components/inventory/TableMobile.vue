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
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-gray-400">Stock Initial</span>
                <span>{{ getMetric(productName, day, 'initial_portion') }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-xs text-gray-400">Entrées</span>
                <span>{{ getMetric(productName, day, 'entry') }}</span>
              </div>

              <div>
                <div class="text-xs text-primary mb-1">Sortie</div>
                <UInputNumber
                  v-model.number="saleInputs[productName][idx]"
                  :min="0"
                  size="lg"
                  class="w-full"
                  @blur="handleUpdateSale(productName, idx)"
                />
              </div>

              <div class="flex justify-between">
                <span class="text-xs text-blue-400">Stock Final</span>
                <span class="text-blue-600">{{ getMetric(productName, day, 'final_portion') }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-xs text-green-400">Restant</span>
                <span class="text-green-600">{{ getMetric(productName, day, 'remaining') }}</span>
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

const { post } = useApi();
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

function handleUpdateSale(productName: string, dayIndex: number) {
  updateSale(productName, dayIndex, post, toast);
}
</script>