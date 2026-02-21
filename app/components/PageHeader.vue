<template>
  <BackButton class="mb-4" />
  <div class="flex justify-between items-center mb-6">
    <!-- Titre de la page -->
    <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
      {{ title }}
    </h1>

    <!-- Bouton d'ajout conditionnel -->
    <UButton
      v-if="showAdd"
      color="primary"
      label="Ajouter"
      icon="i-heroicons-plus"
      @click="emit('add')"
    />
  </div>
</template>

<script setup lang="ts">
// Props simples
defineProps<{
  title: string;
  showAdd?: boolean;
}>();

// Emit simple
const emit = defineEmits<{
  add: [];
}>();
</script>