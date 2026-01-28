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
const error = ref<string | null>(null)

const loadTransformation = async () => {
  try {
    loading.value = true
    error.value = null
    transformation.value = await get<TransformationSummary>(
      `/transformations/${transformationId.value}/summary`
    )
  } catch (err: any) {
    error.value = err?.response?._data?.message || 'Transformation non trouvée'
    toast.add({
      title: 'Erreur',
      description: error.value,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTransformation()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6">
    <div class="container mx-auto px-4 max-w-4xl">
      
      <!-- Header -->
      <div class="max-w-3xl mx-auto mb-8 space-y-4">
        <BackButton label="Retour" />
        
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Nouvelle Étape de Transformation
          </h1>
          <p class="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Ajouter une étape de transformation au processus
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="max-w-3xl mx-auto space-y-6">
        <UCard>
          <template #header>
            <USkeleton class="h-7 w-1/3" />
          </template>
          <div class="space-y-4">
            <USkeleton class="h-12 w-full" />
            <div class="grid grid-cols-2 gap-4">
              <USkeleton class="h-12 w-full" />
              <USkeleton class="h-12 w-full" />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <USkeleton class="h-10 w-24" />
              <USkeleton class="h-10 w-32" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Error -->
      <div v-else-if="error || !transformation" class="max-w-3xl mx-auto">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="soft"
        >
          <template #title>Transformation introuvable</template>
          <template #description>
            {{ error || "Cette transformation n'existe pas." }}
          </template>
          <template #actions>
            <UButton to="/purchases" color="error" size="sm">
              Retour aux achats
            </UButton>
          </template>
        </UAlert>
      </div>

      <!-- Formulaire -->
      <TransformationStepAdd
        v-if="transformation"
        :transformation="transformation"
      />
      
    </div>
  </div>
</template>