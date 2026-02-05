<template>
  <div class="grid grid-cols-3 gap-3">
    <!-- Total Portions -->
    <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
      <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">
        Portions
      </span>
      <span class="text-lg font-bold text-gray-900 dark:text-white">
        {{ transformation.total_portions || 0 }}
      </span>
    </div>

    <!-- Total Quantité -->
    <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center border-x border-gray-100 dark:border-gray-700">
      <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">
        Quantité
      </span>
      <span class="text-lg font-bold text-gray-900 dark:text-white">
        {{ transformation?.total_quantity_used?.toFixed(2) || 0 }}
        <span class="text-xs font-normal text-gray-500">{{ transformation.unit }}</span>
      </span>
    </div>

    <!-- Stock Restant -->
    <div 
      class="p-3 rounded-lg text-center"
      :class="isLowStock ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'"
    >
      <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">
        Restant
      </span>
      <span 
        class="text-lg font-bold"
        :class="isLowStock ? 'text-red-600' : 'text-green-600'"
      >
        {{ transformation?.remaining_quantity?.toFixed(2) || '0' }}
        <span class="text-xs font-normal text-gray-500">{{ transformation.unit }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  transformation: Transformation;
}>();

const isLowStock = computed(() => props.transformation.remaining_quantity < 0.5);
</script>