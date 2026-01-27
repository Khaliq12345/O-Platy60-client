<script setup lang="ts">
defineProps<{
  itemName: string
}>()

const emit = defineEmits<{
  'edit': []
  'delete': []
  'back': []
}>()
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div>
      <UButton
        color="neutral"
        variant="link"
        icon="i-heroicons-arrow-left"
        label="Retour aux achats"
        class="px-0 mb-2"
        @click="emit('back')"
      />
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {{ itemName }}
      </h1>
    </div>
    
    <div class="flex gap-3">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-pencil"
        label="Modifier"
        @click="emit('edit')"
      />
      <UButton
        color="error"
        variant="outline"
        icon="i-heroicons-trash"
        label="Supprimer"
        @click="emit('delete')"
      />
    </div>
  </div>
</template>