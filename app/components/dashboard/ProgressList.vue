<template>
  <div class="space-y-5">
    <div v-for="item in items" :key="item.label" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="font-semibold text-gray-900 dark:text-white uppercase tracking-wide">{{ item.label }}</span>
        <span class="text-gray-500 font-medium">{{ item.value }}{{ item.suffix }}</span>
      </div>
      <UProgress v-model="item.value" :max="100" color="primary" size="md" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: { label: string; value: number; suffix?: string }[]
}>()
</script>