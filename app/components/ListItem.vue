<template>
  <div
    class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
  >
    <div class="flex items-center gap-3">
      <UButton
        color="neutral"
        variant="ghost"
        :icon="icon"
        size="xs"
        class="rounded-full"
      />
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</span>
    </div>
    <span v-if="type == 'text'" class="font-medium">{{ value }}</span>
    <UBadge
      v-if="type == 'badge'"
      color="error"
      variant="subtle"
      class="capitalize"
    >
      {{ value }}
    </UBadge>
    <slot name="button" v-if="type == 'button'" />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  icon: string;
  type: "text" | "badge" | "button";
}>();
</script>
