<template>
  <div class="space-y-2 px-2">
    <h3 class="text-md md:text-lg font-semibold text-gray-900 dark:text-white">
      Transformations Effectuées
    </h3>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-20 w-full" />
    </div>

    <!-- Liste -->
    <div v-else class="space-y-2 px-2">
      <PurchaseTransformationStep
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :step-number="index + 1"
        :unit="unit"
      />
    </div>
  </div>
</template>

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
