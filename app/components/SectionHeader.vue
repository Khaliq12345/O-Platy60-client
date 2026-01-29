<template>
  <div class="flex items-center justify-between">
    <h2 class="text-md md:text-lg font-semibold text-gray-900 dark:text-white">
      {{ title }}
    </h2>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
}>();
</script>
