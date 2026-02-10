<template>
  <UCollapsible v-model:open="isOpen">
    <template #content>
      <div class="px-4 pb-4 pt-2 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <div class="text-xs text-gray-500 uppercase mb-1">Total ventes</div>
            <div class="text-2xl font-semibold text-rose-500">—</div>
          </div>

          <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <div class="text-xs text-gray-500 uppercase mb-1">Stock final</div>
            <div class="text-2xl font-semibold text-primary">—</div>
          </div>

          <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <div class="text-xs text-gray-500 uppercase mb-1">Inventaire</div>
            <UInputNumber :min="0" size="lg" class="w-24 mx-auto" color="primary" />
          </div>

          <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <div class="text-xs text-gray-500 uppercase mb-1">Écart</div>
            <div class="text-2xl font-semibold text-gray-900 dark:text-white">—</div>
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false });
</script>