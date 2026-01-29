<template>
  <BackButton class="mb-2" />
  <div
    class="px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
  >
    <div>
      <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {{ itemName }}
      </h1>
    </div>

    <div class="flex gap-3">
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-heroicons-pencil"
        label="Modifier"
      />
      <UButton
        size="sm"
        color="error"
        variant="outline"
        icon="i-heroicons-trash"
        label="Supprimer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  itemName: string;
}>();
</script>
