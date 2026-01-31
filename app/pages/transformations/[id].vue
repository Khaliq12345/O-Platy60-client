<template>
  <div class="w-full">
      <!-- Loading -->
      <div v-if="loading" class="h-full w-full mt-6">
        <Loading />
      </div>
      
      <!-- Content -->
      <div v-else-if="transformation && !loading" class="w-full md:w-3/4 md:mx-auto px-4 flex flex-col items-center justify-between gap-4 mt-4">

        <!-- HEADER -->
        <TransformationDetailHeader
          :transformation="transformation"
          :unit="transformation?.unit"
          class="w-full"
        />

        <!-- Liste des étapes -->
        <div class="mb-auto w-full">
          <TransformationStepsList
            :transformation-id="transformationId"
            :transformation="transformation"
            :unit="transformation?.unit"
          />
        </div>

        <!-- Footer résumé -->
        <TransformationSummaryFooter
        class="justify-self-end w-full"
          :total-portions="transformation.total_portions || 0"
          :total-quantity="transformation.total_step_quantity || 0"
          :remaining-quantity="transformation.remaining_quantity || 0"
          :unit="transformation?.unit"
        />
      </div>

      <!-- Error -->
      <UEmpty
      v-else
        icon="i-lucide-file"
        title="Aucune transformation trouvée"
        description="Cette transformation n'existe pas ou a été supprimée."
      />
  </div>
</template>

<script setup lang="ts">
import type { TransformationSummary } from '~/types/transformation'

const route = useRoute()
const { get } = useApi()
const toast = useToast()

const transformationId = computed(() => route.params.id as string)
const loading = ref(true)
const transformation = ref<TransformationSummary | null>(null)

// Optionnel : récupérer l'unité si nécessaire (depuis l'achat ou ailleurs)
const unit = ref('kg')

const loadTransformation = async () => {
  loading.value = true
  try {
    transformation.value = await get<TransformationSummary>(
      `/transformations/${transformationId.value}`
    )
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger la transformation',
      color: 'error'
    })        
  }
  loading.value = false
}

onMounted(() => {
  loadTransformation()
})
</script>