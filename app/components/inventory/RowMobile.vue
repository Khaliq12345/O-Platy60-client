<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
    <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
      <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        @click="toggleOpen"
      />
    </div>

    <div class="p-3 space-y-2">
      <div v-for="day in visibleDays" :key="day.date" class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400 w-16">
          {{ formatDayLabel(day.date) }}
        </span>
        
        <div class="flex gap-2">
          <UInputNumber :model-value="day.entry" disabled size="sm" class="w-20 opacity-60" />
          <UInputNumber
            :model-value="day.sale"
            :min="0"
            size="sm"
            placeholder="0"
            class="w-20"
            @update:model-value="function(val) { emitUpdateSale(day, val) }"
          />
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
        <div v-for="day in hiddenDays" :key="day.date" class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400 w-16">
            {{ formatDayLabel(day.date) }}
          </span>
          
          <div class="flex gap-2">
            <UInputNumber :model-value="day.entry" disabled size="sm" class="w-20 opacity-60" />
            <UInputNumber
              :model-value="day.sale"
              :min="0"
              size="sm"
              placeholder="0"
              class="w-20"
              @update:model-value="function(val) { emitUpdateSale(day, val) }"
            />
          </div>
        </div>
      </template>
    </div>

    <InventoryDetails v-model:open="isOpen" />
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Inventory } from "~/types/inventory";
import type { DayData } from "~/types/inventory";

const props = defineProps<{
  item: Inventory;
  days: DayData[];
}>();

const emit = defineEmits<{
  updateSale: [data: { date: string; sale: number; transactionId?: number }];
}>();

const isOpen = ref(false);
const showAll = ref(false);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function showMore() {
  showAll.value = true;
}

function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  const dayName = format(date, 'EEE', { locale: fr });
  const dayNumber = format(date, 'dd');
  return dayName + ' ' + dayNumber;
}

function emitUpdateSale(day: DayData, val: number | null) {
  emit('updateSale', {
    date: day.date,
    sale: val ?? 0,
    transactionId: day.transactionId
  });
}

const visibleDays = computed(function() {
  return props.days.slice(0, 3);
});

const hiddenDays = computed(function() {
  return props.days.slice(3);
});
</script>