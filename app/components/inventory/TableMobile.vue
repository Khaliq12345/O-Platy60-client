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
      <div>
        <div 
          ref="carouselRef"
          class="pl-2 flex gap-2 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          @scroll="handleScroll"
        >
          <div
            v-for="(day, idx) in days"
            :key="day.date"
            class="shrink-0 w-[50%] snap-center px-3 py-2 rounded-md bg-gray-200/50 dark:bg-gray-800/50"
          >
            <div class="text-sm font-semibold text-primary mb-3">
              {{ formatDayFull(day.date) }}
            </div>
            
            <div class="space-y-3">
              <!-- Initial -->
              <div>
                <div class="text-xs text-gray-400 uppercase mb-1">Initial</div>
                <div class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ getEntry(item.inventory_id, day.date) }}
                </div>
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

              <!-- Stock final -->
              <div>
                <div class="text-xs text-gray-400 uppercase mb-1">Stock final</div>
                <div class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ calculateStock(item.inventory_id, day.date, idx) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Inventory, DayData, DailyTransactionSummary } from "~/types/inventory";

const props = defineProps<{
  items: Inventory[];
  days: DayData[];
  transactions: Record<string, DailyTransactionSummary[]>;
}>();

const { post } = useApi();
const toast = useToast();

const saleInputs = ref<Record<string, number[]>>({});
const openSummaries = ref<Record<string, boolean>>({});
const currentDayIndex = ref(0);

watch(() => props.items, (newItems) => {
  newItems.forEach((item) => {
    if (!saleInputs.value[item.inventory_id]) {
      saleInputs.value[item.inventory_id] = props.days.map((day) => {
        const tx = props.transactions[item.inventory_id]?.find(
          (t) => t.summary_date === day.date
        );
        return tx?.total_sales ?? 0;
      });
    }
  });
}, { immediate: true });

function formatDayFull(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEE, MMM dd", { locale: fr }).toUpperCase();
}

function getEntry(inventoryId: string, date: string): number {
  const tx = props.transactions[inventoryId]?.find((t) => t.summary_date === date);
  return tx?.total_quantity ?? 0;
}

function calculateStock(inventoryId: string, date: string, dayIndex: number): number {
  const entry = getEntry(inventoryId, date);
  const sale = saleInputs.value[inventoryId]?.[dayIndex] ?? 0;
  return Math.max(0, entry - sale);
}

function getCurrentStock(item: Inventory): number {
  const today = new Date().toISOString().split('T')[0];
  const todayTx = props.transactions[item.inventory_id]?.find(
    (t) => t.summary_date === today
  );
  return todayTx?.total_quantity ?? item.initial_quantity ?? 0;
}

function toggleSummary(inventoryId: string) {
  openSummaries.value[inventoryId] = !openSummaries.value[inventoryId];
}

function handleScroll(e: Event) {
  const target = e.target as HTMLElement;
  const scrollLeft = target.scrollLeft;
  const cardWidth = target.offsetWidth * 0.85;
  currentDayIndex.value = Math.round(scrollLeft / cardWidth);
}

async function updateSale(item: Inventory, day: DayData, index: number) {
  try {
    await post(`/inventories/transactions`, {
      inventory_id: item.inventory_id,
      sale: saleInputs.value[item.inventory_id][index] ?? 0,
      created_at: day.date,
    });

    toast.add({
      title: "Succès",
      description: "Vente enregistrée",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible d'enregistrer la vente",
      color: "error",
    });
  }
}
</script>