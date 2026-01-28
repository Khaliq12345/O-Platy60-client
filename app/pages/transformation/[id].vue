
<script setup lang="ts">
import type { TransformationSummary } from '~/types/transformation'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { get } = useApi()
const toast = useToast()

const transformationId = computed(() => route.params.id as string)
const loading = ref(true)
const transformation = ref<TransformationSummary | null>(null)

// Optionnel : récupérer l'unité si nécessaire (depuis l'achat ou ailleurs)
const unit = ref('kg')

const loadTransformation = async () => {
  try {
    loading.value = true
    transformation.value = await get<TransformationSummary>(
      `/transformations/${transformationId.value}/summary`
    )
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger la transformation',
      color: 'error'
    })
    router.push('/purchases')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTransformation()
})
</script>

<template>
  <div class="mx-auto px-2">
    <div class="flex flex-col px-4 py-6 max-w-4xl">
      
      <!-- HEADER : Objet complet passé -->
      <TransformationDetailHeader
        :transformation="transformation"
        :unit="unit"
        :loading="loading"
      />

      <!-- Loading -->
      <div v-if="loading" class="space-y-6 mt-6">
        <USkeleton class="h-64 w-full" />
        <USkeleton class="h-16 w-full" />
      </div>

      <!-- Content -->
      <div v-else-if="transformation" class="space-y-6 mt-6">
        
        <!-- Liste des étapes -->
        <TransformationStepsList
          :transformation-id="transformationId"
          :unit="unit"
        />

        <!-- Footer résumé -->
        <TransformationSummaryFooter
        class="justify-self-end"
          :total-portions="transformation.total_portions"
          :total-quantity="transformation.total_step_quantity"
          :remaining-quantity="transformation.remaining_quantity"
          :unit="unit"
        />
      </div>

      <!-- Error -->
      <UAlert
        v-else
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        title="Transformation introuvable"
        class="mt-6"
      >
        <template #actions>
          <UButton to="/purchases" color="error" variant="solid" size="sm">
            Retour aux achats
          </UButton>
        </template>
      </UAlert>
      
    </div>
  </div>
</template>