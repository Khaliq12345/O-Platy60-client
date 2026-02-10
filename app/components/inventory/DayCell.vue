<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between gap-2">
      <div class="text-center">
        <span class="text-[10px] uppercase text-gray-400 font-medium block mb-0.5">Entrées</span>
        <p class="font-medium text-gray-900 dark:text-gray-100">{{ entries ?? '—' }}</p>
      </div>
      
      <div class="text-center">
        <span class="text-[10px] uppercase text-gray-400 font-medium block mb-0.5">Ventes</span>
        <UInputNumber 
          v-model="salesValue" 
          :min="0" 
          size="sm" 
          placeholder="—"
          class="w-16"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  entries: number | null;
  sales: number | null;
}>();

const salesValue = ref(props.sales);
</script>