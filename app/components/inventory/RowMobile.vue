<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
      <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        @click="isOpen = !isOpen"
      />
    </div>

    <div class="p-4 space-y-1">
      <div v-for="(day, index) in visibleDays" :key="index" class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
        <div class="font-medium text-gray-600 dark:text-gray-400 w-20">{{ weekDays[index] }}</div>
        <div class="flex items-center gap-4">
          <div class="text-center">
            <span class="text-[10px] uppercase text-gray-400 font-medium block">Entrées</span>
            <p class="font-medium text-gray-900 dark:text-gray-100">{{ day?.entries ?? '—' }}</p>
          </div>
          <div class="text-center">
            <span class="text-[10px] uppercase text-gray-400 font-medium block">Ventes</span>
            <UInputNumber v-model="day.sales" :min="0" size="sm" placeholder="—" class="w-16" />
          </div>
        </div>
      </div>

      <UButton v-if="!showAll && days.length > 3" variant="link" size="sm" color="primary" block class="mt-2" @click="showAll = true">
        Voir les 4 autres jours
      </UButton>

      <template v-if="showAll">
        <div v-for="(day, index) in hiddenDays" :key="index + 3" class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
          <div class="font-medium text-gray-600 dark:text-gray-400 w-20">{{ weekDays[index + 3] }}</div>
          <div class="flex items-center gap-4">
            <div class="text-center">
              <span class="text-[10px] uppercase text-gray-400 font-medium block">Entrées</span>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ day?.entries ?? '—' }}</p>
            </div>
            <div class="text-center">
              <span class="text-[10px] uppercase text-gray-400 font-medium block">Ventes</span>
              <UInputNumber v-model="day.sales" :min="0" size="sm" placeholder="—" class="w-16" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <InventoryDetails v-model:open="isOpen" />
  </div>
</template>

<script setup lang="ts">
import type { Inventory } from '~/types/inventory';

interface DayValue {
  entries: number | null;
  sales: number | null;
}

const props = defineProps<{
  item: Inventory;
  days: DayValue[];
}>();

const isOpen = ref(false);
const showAll = ref(false);
const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const visibleDays = computed(() => props.days.slice(0, 3));
const hiddenDays = computed(() => props.days.slice(3));
</script>