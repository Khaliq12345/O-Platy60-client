<template>
  <div class="space-y-2">
    <div
      v-for="activity in activities"
      :key="activity.id"
      class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div class="p-2.5 rounded-lg shrink-0" :class="`bg-${activity.color}-100 dark:bg-${activity.color}-900/30`">
        <UIcon :name="activity.icon" class="w-5 h-5" :class="`text-${activity.color}-600 dark:text-${activity.color}-400`" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="`bg-${activity.color}-100 text-${activity.color}-700 dark:bg-${activity.color}-900/30 dark:text-${activity.color}-400`">
            {{ activity.type }}
          </span>
          <span class="text-sm text-gray-600 dark:text-gray-300 truncate">{{ activity.item }}</span>
        </div>
        <span class="text-xs text-gray-400 mt-1 block">{{ activity.date }}</span>
      </div>
      <div class="text-right shrink-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ activity.value }}</p>
        <UBadge :color="statusColor(activity.status)" size="xs" variant="soft" class="mt-1">
          {{ activity.status }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activities: any[]
}>()

const statusColor = (status: string): 'success' | 'warning' | 'error' => {
  if (status === 'Complété') return 'success'
  if (status === 'En cours') return 'warning'
  return 'error'
}
</script>