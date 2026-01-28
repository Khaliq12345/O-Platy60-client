<script setup lang="ts">
import type { TransformationStep } from '~/types/transformation'

const props = defineProps<{
  step: TransformationStep
  stepNumber: number
  unit?: string
}>()

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex flex-col md:flex-row md:items-center gap-4">
      <!-- Numéro et Date -->
      <div class="flex items-center gap-3 md:w-48 shrink-0">
        <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
          #{{ stepNumber }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ formatDateTime(step.created_at) }}
        </div>
      </div>

      <!-- Nom de l'étape -->
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
          {{ step.step_name }}
        </h4>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-6 text-sm md:justify-end">
        <div class="text-center md:text-right">
          <span class="text-gray-500 dark:text-gray-400 block text-xs">Portions</span>
          <span class="font-semibold text-green-600 text-lg">{{ step.portions }}</span>
        </div>
        
        <div class="text-center md:text-right">
          <span class="text-gray-500 dark:text-gray-400 block text-xs">Quantité</span>
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ step.quantity }} 
            <span class="text-gray-500 text-xs">{{ unit || 'kg' }}</span>
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>