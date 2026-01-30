<script setup lang="ts">
import type {
  Transformation,
  TransformationStep,
} from "~/types/transformation";

const props = defineProps<{
  transformationId: string;
  transformation: Transformation;
  unit?: string;
}>();

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const steps = ref<TransformationStep[]>([]);

const loadSteps = async () => {
  try {
    loading.value = true;
    steps.value = await get<TransformationStep[]>(
      `/transformation-steps/${props.transformationId}/`,
    );
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les étapes",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSteps();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4 items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Transformations Effectuées
      </h3>
      <UModal
        title="Nouvelle Étape"
        description="Ajouter une étape de transformation"
      >
        <UButton
          color="primary"
          variant="outline"
          icon="i-heroicons-plus"
        />
        <template #content>
          <TransformationStepAdd :transformation="transformation" />
        </template>
      </UModal>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-20 w-full" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="steps.length === 0"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <UIcon
        name="i-heroicons-clipboard-document-list"
        class="w-12 h-12 text-gray-400 mx-auto mb-3"
      />
      <p class="text-gray-500 dark:text-gray-400">
        Aucune étape de transformation
      </p>
    </div>

    <!-- Liste -->
    <div v-else class="space-y-3">
      <TransformationStepCard
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :step-number="index + 1"
        :unit="unit"
      />
    </div>
  </div>
</template>
