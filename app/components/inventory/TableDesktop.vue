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

        <!-- Entrées -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Entrées</div>
          <div
            v-for="(day, idx) in days"
            :key="idx"
            class="text-center text-sm text-gray-900 dark:text-gray-100"
          >
            {{ getEntry(item.inventory_id, day.date) || "—" }}
          </div>
        </div>

        <!-- Ventes -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2 bg-primary-50 dark:bg-primary-950/30 rounded-md">
          <div class="text-sm text-primary dark:text-primary-400 font-medium flex items-center">
            Ventes
          </div>
          <div v-for="(day, idx) in days" :key="idx" class="px-1">
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

        <!-- Stock Final -->
        <div class="grid grid-cols-8 gap-4 py-3 px-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">Stock Final</div>
          <div
            v-for="(day, idx) in days"
            :key="idx"
            class="text-center text-sm font-medium text-primary dark:text-primary-400"
          >
            {{ calculateStock(item.inventory_id, day.date, idx) }}
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

function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEE dd", { locale: fr }).toUpperCase();
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

function toggleSummary(inventoryId: string) {
  openSummaries.value[inventoryId] = !openSummaries.value[inventoryId];
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