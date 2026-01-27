<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:itemsPerPage': [count: number]
}>()

const perPageOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

const localItemsPerPage = computed({
  get: () => props.itemsPerPage,
  set: (val) => emit('update:itemsPerPage', val)
})
</script>

<template>
  <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-2">
      <UButton 
        color="neutral" 
        variant="ghost"
        icon="i-heroicons-arrow-left"
        label="Précédent"
        :disabled="currentPage === 1"
        @click="emit('update:currentPage', currentPage - 1)"
      />
      
      <div class="flex gap-1">
        <UButton 
          v-for="page in totalPages > 5 ? 5 : totalPages" 
          :key="page"
          :color="currentPage === page ? 'primary' : 'neutral'"
          :variant="currentPage === page ? 'solid' : 'ghost'"
          :label="String(page)"
          @click="emit('update:currentPage', page)"
        />
        <span v-if="totalPages > 5" class="px-2 py-2 text-gray-500">...</span>
        <UButton 
          v-if="totalPages > 5"
          color="neutral"
          variant="ghost"
          :label="String(totalPages)"
          @click="emit('update:currentPage', totalPages)"
        />
      </div>

      <UButton 
        color="neutral" 
        variant="ghost"
        icon="i-heroicons-arrow-right"
        trailing
        label="Suivant"
        :disabled="currentPage === totalPages"
        @click="emit('update:currentPage', currentPage + 1)"
      />
    </div>

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">Afficher:</span>
      <USelect 
        v-model="localItemsPerPage"
        :items="perPageOptions"
        class="w-20"
      />
    </div>
  </div>
</template>