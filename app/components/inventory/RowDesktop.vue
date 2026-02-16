<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
  >
    <div
      class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800"
    >
      <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
        {{ item.name }}
      </h3>
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        @click="toggleOpen"
      />
    </div>

    <div class="p-4 grid grid-cols-7 gap-3">
      <div v-for="(day, index) in days" :key="day.date">
        <div
          class="text-xs font-medium text-gray-500 uppercase text-center mb-2"
        >
          {{ formatDayLabel(day.date) }}
        </div>

        <div class="space-y-2">
          <UFormField label="Entrées">
            <UInputNumber
              :model-value="day.entry"
              disabled
              size="sm"
              class="w-full opacity-60"
            />
          </UFormField>
          <UFormField :label="`Vente: ${day.sale}`">
            <UInputNumber
              v-model="saleInputs[index]"
              :min="0"
              size="sm"
              placeholder="0"
              class="w-full"
              @blur="emitUpdateSale(day, index)"
              @keyup.enter="emitUpdateSale(day, index)"
            />
          </UFormField>
        </div>
      </div>
    </div>

    <InventoryDetails
      v-model:open="isOpen"
      :inventory-id="item.inventory_id"
      :start-date="days[0]?.date"
      :end-date="days[6]?.date"
    />
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Inventory, DayData } from "~/types/inventory";

const props = defineProps<{
  item: Inventory;
  days: DayData[];
}>();

const emit = defineEmits<{
  updateSale: [data: { date: string; sale: number; transactionId?: number }];
}>();

const isOpen = ref(false);

// Tableau de refs pour stocker la valeur de chaque input
// Initialisé avec les valeurs de day.sale (0 si pas de vente)
const saleInputs = ref<number[]>(props.days.map(() => 0));

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  const dayName = format(date, "EEE", { locale: fr });
  const dayNumber = format(date, "dd");
  return dayName + " " + dayNumber;
}

function emitUpdateSale(day: DayData, index: number) {
  emit("updateSale", {
    date: day.date,
    sale: saleInputs.value[index] ?? 0,
    // transactionId: day.transactionId,
  });
}
</script>
