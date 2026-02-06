<template>
  <UCollapsible class="w-full">
    <!-- Header (toujours visible) -->
    <div
      class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
    >
      <div class="flex items-center gap-3">
        <h3
          class="text-md md:text-lg font-semibold text-gray-900 dark:text-white"
        >
          Transformations Effectuées
        </h3>

        <!-- Badge compteur -->
        <UBadge
          v-if="!loading"
          :label="steps.length.toString()"
          color="primary"
          size="sm"
          variant="soft"
        />
      </div>

      <!-- Chevron animé -->
      <UIcon
        name="i-lucide-chevron-down"
        class="w-5 h-5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </div>

    <!-- Contenu (visible quand ouvert) -->
    <template #content>
      <div class="pt-2 pb-1 space-y-2">
        <!-- Loading -->
        <div v-if="loading" class="space-y-3 px-2">
          <USkeleton v-for="i in 2" :key="i" class="h-20 w-full" />
        </div>

        <!-- Liste vide -->
        <div
          v-else-if="steps.length === 0"
          class="text-center py-4 text-gray-500 text-sm"
        >
          Aucune transformation effectuée
        </div>

        <!-- Liste -->
        <div v-else class="space-y-2 px-2">
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
  </UCollapsible>
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
