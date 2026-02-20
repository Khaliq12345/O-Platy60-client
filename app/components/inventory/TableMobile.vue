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
        <span class="text-xs text-gray-500">
          {{ item.initial_quantity }} {{ item.unit }}
        </span>
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
              {{ formatDayFull(day.date) }}
            </span>
          </template>

          <template #description>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400 uppercase">Stock Initial</span>
                <span class="text-lg font-medium">{{ getMetric(item.inventory_id, day.date, 'initial') }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400 uppercase">Entrées</span>
                <span class="text-lg font-medium">{{ getMetric(item.inventory_id, day.date, 'entries') }}</span>
              </div>

              <div>
                <div class="text-xs text-primary uppercase mb-1">Sortie</div>
                <UInputNumber
                  v-model.number="saleInputs[item.inventory_id][idx]"
                  :min="0"
                  size="lg"
                  class="w-full"
                  color="primary"
                  @blur="handleUpdateSale(item, day, idx)"
                />
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-blue-400 uppercase">Stock Final</span>
                <span class="text-lg font-medium text-blue-600">{{ getMetric(item.inventory_id, day.date, 'final') }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-green-400 uppercase">Restant</span>
                <span class="text-lg font-medium text-green-600">{{ getMetric(item.inventory_id, day.date, 'remaining') }}</span>
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
import { useInventoryLogic } from "~/utils/inventoryextra";

const props = defineProps<{
  items: Inventory[];
  days: DayData[];
  transactions: Record<string, DailyTransactionSummary[]>;
}>();

const { post } = useApi();
const toast = useToast();

const itemsRef = computed(() => props.items);
const daysRef = computed(() => props.days);
const transactionsRef = computed(() => props.transactions);

const {
  saleInputs,
  openSummaries,
  formatDayFull,
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