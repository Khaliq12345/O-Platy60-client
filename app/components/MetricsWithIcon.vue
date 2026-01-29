<template>
  <div
    v-if="direction === 'horizontal'"
    class="flex items-center justify-around p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
  >
    <div
      class="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm"
    >
      <UIcon :name="icon" class="w-4 h-4 text-amber-500 text-sm" size="sm" />
      {{ title }}
    </div>
    <div
      class="text-sm md:text-2xl font-semibold text-gray-900 dark:text-white"
    >
      {{ value }}
    </div>
  </div>

  <div v-else class="flex items-center gap-3">
    <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
      <UIcon
        :name="icon"
        class="w-5 h-5 text-gray-600 dark:text-gray-400 text-sm"
        size="sm"
      />
    </div>
    <div>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ title }}</p>
      <p class="font-medium text-gray-900 dark:text-white text-sm text-nowrap">
        {{ value || "Non attribué" }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  value: string | number;
  icon?: string;
  direction?: "horizontal" | "vertical";
}

withDefaults(defineProps<Props>(), {
  icon: "i-heroicons-information-circle",
  direction: "horizontal",
});
</script>
