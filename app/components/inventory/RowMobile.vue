<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
  >
    <div
      class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800"
    >
      <h3 class="font-semibold text-gray-900 dark:text-white">
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

    <div class="p-3 space-y-2">
      <div
        v-for="(day, index) in visibleDays"
        :key="day.date"
        class="flex items-center justify-between"
      >
        <span class="text-sm text-gray-600 dark:text-gray-400 w-16">
          {{ formatDayLabel(day.date) }}
        </span>

        <div class="flex gap-2">
          <UFormField label="Entrées">
            <UInputNumber
              :model-value="day.entry"
              disabled
              size="sm"
              class="w-20 opacity-60"
            />
          </UFormField>
          <UFormField :label="`Vente: ${day.sale}`">
            <UInputNumber
              v-model="saleInputs[index]"
              :min="0"
              size="sm"
              placeholder="0"
              class="w-20"
              @blur="emitUpdateSale(day, index)"
              @keyup.enter="emitUpdateSale(day, index)"
            />
          </UFormField>
        </div>
      </div>

      <UButton
        v-if="!showAll && days.length > 3"
        variant="link"
        size="sm"
        color="primary"
        block
        @click="showMore"
      >
        Voir plus
      </UButton>

      <template v-if="showAll">
        <div
          v-for="(day, idx) in hiddenDays"
          :key="day.date"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400 w-16">
            {{ formatDayLabel(day.date) }}
          </span>

          <div class="flex gap-2">
            <UFormField label="Entrées">
              <UInputNumber
                :model-value="day.entry"
                disabled
                size="sm"
                class="w-20 opacity-60"
              />
            </UFormField>
            <UFormField label="Vente">
              <UInputNumber
                v-model="saleInputs[visibleDays.length + idx]"
                :min="0"
                size="sm"
                placeholder="0"
                class="w-20"
                @blur="emitUpdateSale(day, visibleDays.length + idx)"
                @keyup.enter="emitUpdateSale(day, visibleDays.length + idx)"
              />
            </UFormField>
          </div>
        </div>
      </template>
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
const showAll = ref(false);

const saleInputs = ref<number[]>([]);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function showMore() {
  showAll.value = true;
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
    // transactionId: day.transactionId
  });
}

const visibleDays = computed(function () {
  return props.days.slice(0, 3);
});

const hiddenDays = computed(function () {
  return props.days.slice(3);
});
</script>
