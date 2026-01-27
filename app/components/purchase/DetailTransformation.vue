<script setup lang="ts">
defineProps<{
  isTransformed: boolean
}>()

const emit = defineEmits<{
  'create-section': []
}>()
</script>

<template>
  <UCard class="h-full">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Transformation
    </h3>

    <UBadge 
      :color="isTransformed ? 'primary' : 'neutral'" 
      variant="subtle"
      class="rounded-full mb-6"
    >
      {{ isTransformed ? 'Transformé' : 'Non transformé' }}
    </UBadge>

    <UButton
      v-if="!isTransformed"
      color="primary"
      variant="outline"
      block
      icon="i-heroicons-plus"
      label="Créer Section de Transformation"
      @click="emit('create-section')"
    />
  </UCard>
</template>