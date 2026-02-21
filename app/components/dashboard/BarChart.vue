<template>
  <div class="h-64 flex items-end justify-between gap-2">
    <div
      v-for="item in data"
      :key="item.label"
      class="flex-1 flex flex-col items-center gap-2"
    >
      <div
        class="w-full bg-blue-500 rounded-t-md transition-all duration-500"
        :style="{ height: `${(item.value / maxValue) * 100}%` }"
      />
      <span class="text-xs text-gray-500">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: { label: string; value: number }[]
}>()

const maxValue = computed(() => Math.max(...props.data.map(d => d.value)))
</script>