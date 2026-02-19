<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
      Liste des catégories
    </h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categoriesCount?: number;
}>();
</script>
