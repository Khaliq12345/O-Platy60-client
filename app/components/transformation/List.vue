<script setup lang="ts">
import type { TransformationSummary, TransformationStep } from '~/types/transformation'

const props = defineProps<{
  transformation: TransformationSummary
}>()

const { get } = useApi()
const steps = ref<TransformationStep[]>([])
const loadingSteps = ref(false)

const loadSteps = async () => {
  try {
    loadingSteps.value = true
    steps.value = await get<TransformationStep[]>(`/transformation-steps/${props.transformation.id}/`)
  } catch (error) {
    steps.value = []
  } finally {
    loadingSteps.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Stats configurables
const stats = computed(() => [
  {
    label: 'Reçu',
    value: props.transformation.quantity_received,
    unit: 'kg',
    extra: null
  },
  {
    label: 'Utilisable',
    value: props.transformation.quantity_usable,
    unit: 'kg',
    extra: null
  },
  {
    label: 'Déchets initiaux',
    value: props.transformation.waste_quantity,
    unit: 'kg',
    extra: `${Math.round((props.transformation.waste_quantity / props.transformation.quantity_received) * 100)}%`
  }
])

onMounted(() => {
  loadSteps()
})
</script>

<template>
  <UCard class="overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Header primary -->
    <div class="px-4 py-3 flex items-center gap-3">
      <UBadge color="primary" variant="solid" class="rounded-full">
        {{ formatDate(transformation.transformation_date) }}
      </UBadge>
      <span class="text-sm text-primary-900 dark:text-primary-200">
        Depuis: 
        <NuxtLink 
          :to="`/purchases/${transformation.purchase_id}`" 
          class="underline hover:no-underline font-medium"
        >
          Achat - {{ transformation.quantity_received }}kg
        </NuxtLink>
      </span>
    </div>

    <div class="p-4 space-y-4">
      <!-- Titre et badge compteur -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ transformation.product_name }}
        </h3>
        <UBadge color="neutral" variant="soft" class="w-fit">
          {{ steps.length }} transformations effectuées
        </UBadge>
      </div>

      <!-- Stats grid - Responsive -->
      <div class="grid grid-cols-3 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
        <div 
          v-for="(stat, index) in stats" 
          :key="index"
          class="p-2 sm:p-3 text-center bg-gray-50/50 dark:bg-gray-800/50 flex flex-col justify-center min-h-[60px] sm:min-h-[72px]"
        >
          <p class="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 uppercase tracking-wider">
            {{ stat.label }}:
          </p>
          <p class="text-sm sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {{ stat.value }} <span class="text-xs font-normal text-gray-500">{{ stat.unit }}</span>
            <span v-if="stat.extra" class="block text-[10px] sm:text-xs text-gray-500 font-normal mt-0.5">
              / {{ stat.extra }}
            </span>
          </p>
        </div>
      </div>

      <!-- Liste des étapes et bouton -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div v-if="loadingSteps" class="flex-1 space-y-1">
          <USkeleton v-for="i in 2" :key="i" class="h-4 w-24" />
        </div>
        
        <div v-else-if="steps.length > 0" class="flex-1">
          <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            <li v-for="step in steps.slice(0, 3)" :key="step.id" class="truncate">
              {{ step.step_name }}
            </li>
            <li v-if="steps.length > 3" class="text-gray-500 italic">
              + {{ steps.length - 3 }} autres...
            </li>
          </ul>
        </div>
        
        <div v-else class="flex-1 text-sm text-gray-500 italic">
          Aucune étape enregistrée
        </div>

        <UButton
          :to="`/transformation/${transformation.id}`"
          color="primary"
          variant="solid"
          trailing-icon="i-heroicons-arrow-right"
          class="w-full sm:w-auto justify-center"
        >
          Voir détails
        </UButton>
      </div>
    </div>
  </UCard>
</template>