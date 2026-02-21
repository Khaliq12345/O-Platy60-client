<template>
  <UCard :ui="{ ring: alert ? 'ring-2 ring-red-500 dark:ring-red-400' : '' }">
    <div class="flex items-start justify-between">
      <div class="p-2 rounded-lg" :class="bgClass">
        <UIcon :name="icon" class="w-5 h-5" :class="textClass" />
      </div>
      <UBadge v-if="trend" :color="trendUp ? 'success' : 'error'" variant="soft" size="sm">
        {{ trend }}
      </UBadge>
    </div>
    <div class="mt-3">
      <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ title }}</p>
      <div class="flex items-baseline gap-1 mt-1">
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ value }}</span>
        <span v-if="unit" class="text-xs text-gray-500">{{ unit }}</span>
      </div>
      <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  value: string
  unit?: string
  subtitle?: string
  icon: string
  trend?: string
  trendUp?: boolean
  alert?: boolean
  color: 'blue' | 'purple' | 'green' | 'red'
}>()

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400' },
  green: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400' },
  red: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400' }
}

const bgClass = computed(() => colorMap[props.color].bg)
const textClass = computed(() => colorMap[props.color].text)
</script>