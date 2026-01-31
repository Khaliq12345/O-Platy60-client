<script setup lang="ts">
defineProps<{
  totalPortions: number
  totalQuantity: number
  remainingQuantity: number
  unit?: string
}>()
</script>

<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
    <div class="grid grid-cols-3 gap-2 sm:gap-4 text-center">
      <!-- Total Portions -->
      <div class="space-y-1">
        <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Portions
        </span>
        <span class="text-md md:text-lg font-bold text-gray-900 dark:text-white">
          {{ totalPortions }}
        </span>
      </div>
      
      <!-- Total Quantité avec séparateur -->
      <div class="space-y-1 border-x border-gray-100 dark:border-gray-700 px-1">
        <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Quantité
        </span>
        <span class="text-md md:text-lg font-bold text-gray-900 dark:text-white">
          {{ totalQuantity.toFixed(2) }}
          <span class="text-xs sm:text-sm font-normal text-gray-500">{{ unit || 'kg' }}</span>
        </span>
      </div>
      
      <!-- Stock Restant -->
      <div class="space-y-1">
        <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Restant
        </span>
        <span 
          class="text-md md:text-lg font-bold" 
          :class="remainingQuantity < 0.5 ? 'text-red-600' : 'text-primary-600'"
        >
          {{ remainingQuantity.toFixed(2) }}
          <span class="text-xs sm:text-sm font-normal text-gray-500">{{ unit || 'kg' }}</span>
        </span>
      </div>
    </div>
  </div>
</template>