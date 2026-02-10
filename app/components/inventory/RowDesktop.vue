<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
      <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ item.name }}</h3>
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        @click="isOpen = !isOpen"
      />
    </div>

    <div class="p-4 grid grid-cols-7 gap-4">
      <div v-for="(day, index) in days" :key="index" class="text-center">
        <div class="text-xs font-medium text-gray-500 uppercase mb-2">{{ shortDays[index] }}</div>
        
        <div class="space-y-2">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <div class="text-[10px] text-gray-400 uppercase mb-1">Entrées</div>
            <p class="font-medium text-gray-900 dark:text-gray-100">{{ day?.entries ?? '—' }}</p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <div class="text-[10px] text-gray-400 uppercase mb-1">Ventes</div>
            <UInputNumber v-model="day.sales" :min="0" size="sm" placeholder="—" class="w-full" />
          </div>
        </div>
      </div>
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

defineProps<{
  item: Inventory;
  days: DayValue[];
}>();

const isOpen = ref(false);
const shortDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
</script>