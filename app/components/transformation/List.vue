<template>
  <div class="p-2 rounded-md shadow hover:shadow-lg transition-shadow duration-300">
    <!-- Header primary -->
    <div class="mt-2 px-2 flex items-center justify-between">
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
          <!-- need to be transformation.unit instead of kg -->
        </NuxtLink>
      </span>
    </div>

    <div class="p-4 space-y-6">
      <!-- Titre et badge compteur -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-2">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ transformation.product_name }}
        </h3>
        <UBadge color="neutral" variant="soft" class="w-fit">
          {{ steps.length }} transformation{{ steps.length > 1 ? 's' : '' }}
        </UBadge>
      </div>

      <!-- Stats grid - Responsive -->
      <div
        class="text-sm md:grid md:grid-cols-3 border border-gray-200 dark:border-gray-700 rounded-md md:rounded-lg overflow-hidden md:divide-x divide-gray-200 dark:divide-gray-700"
      >
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="p-2 text-center bg-gray-50/90 dark:bg-gray-800/50 flex items-center gap-2 md:gap-0 md:flex-col md:justify-center md:min-h-15"
        >
          <p class="text-gray-500 uppercase tracking-wider">
            {{ stat.label }}:
          </p>
          <p
            class="text-sm lg:text-lg font-bold text-gray-900 dark:text-white leading-tight"
          >
            {{ stat.value }}
            <span class="text-xs font-normal text-gray-500">
              {{ stat.unit }}
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
          <ul
            class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5"
          >
            <li
              v-for="step in steps.slice(0, 3)"
              :key="step.id"
              class="truncate"
            >
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
          :to="`/transformations/${transformation.id}`"
          color="primary"
          variant="solid"
          trailing-icon="i-heroicons-arrow-right"
          class="w-full sm:w-auto justify-center"
        >
          Voir détails
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  TransformationSummary,
  TransformationStep,
} from "~/types/transformation";

const props = defineProps<{
  transformation: TransformationSummary;
}>();

const { get } = useApi();
const steps = ref<TransformationStep[]>([]);
const loadingSteps = ref(false);

const loadSteps = async () => {
  try {
    loadingSteps.value = true;
    steps.value = await get<TransformationStep[]>(
      `/transformation-steps/${props.transformation.id}/`,
    );
  } catch (error) {
    steps.value = [];
  } finally {
    loadingSteps.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Stats configurables
const stats = computed(() => [
  {
    label: "Reçu",
    value: props.transformation.quantity_received,
    unit: "kg",
    extra: null,
  },
  {
    label: "Utilisable",
    value: props.transformation.quantity_usable,
    unit: "kg",
    extra: null,
  },
  {
    label: "Déchets",
    value: props.transformation.waste_quantity,
    unit: "kg",
    extra: `${Math.round((props.transformation.waste_quantity / props.transformation.quantity_received) * 100)}%`,
  },
]);

onMounted(() => {
  loadSteps();
});
</script>
