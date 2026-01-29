<template>
  <div class="space-y-1">
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ title }}</p>
    <div class="flex items-baseline gap-2">
      <span
        :class="`text-xl md:text-2xl font-bold text-${color}-500 dark:text-white`"
      >
        {{ value }}
      </span>
      <UBadge color="neutral" variant="soft" size="sm">
        {{ badgeValue }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    value: string;
    badgeValue: string;
    color?: string;
  }>(),
  {
    color: "gray",
  },
);
</script>
