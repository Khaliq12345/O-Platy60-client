<template>
  <div class="flex items-center x-4 py-2">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
      Liste des catégories
    </h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categoriesCount?: number;
}>();
</script>