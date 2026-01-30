<template>
  <UCard>
    <!-- // The title of the section -->
    <template #header>
      <div class="flex items-center justify-between">
        <SectionHeader title="Transformation" />
      </div>
    </template>

    <!-- // Show this when data is loading -->
    <div v-if="loading" class="space-y-4">
      <LoadingSkeleton />
    </div>

    <!-- // Show this if there's no transformation -->
    <div v-else-if="!transformation" class="py-6">
      <UEmpty
        icon="i-lucide-file"
        title="Aucune transformation enregistrée"
        description="Commencez par en créer une pour suivre l'évolution de vos produits"
      >
        <template #actions>
          <UButton
            icon="i-lucide-plus"
            variant="subtle"
            :to="`/transformations/add/${purchaseId}`"
            >Commencez la transformation</UButton
          >
        </template>
      </UEmpty>
    </div>

    <!-- // Show this is there's transformation -->
    <div v-else class="space-y-3">
      <div class="flex">
        <UButton
          :to="`/transformation/${transformation.id}`"
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-eye"
          label="Détails"
        />
      </div>

      <!-- // Show the transformation metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="(metric, index) in transformationMetrics"
          :key="index"
          class="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 transition-all hover:shadow-sm"
        >
          <MetricsWithBadge
            :title="metric.title"
            :value="metric.value"
            :badge-value="metric.badgeValue"
            :color="metric.color"
          />
        </div>
      </div>
    </div>

    <!-- // Button to add new transformation -->
    <template #footer v-if="!transformation && !loading">
      <UModal
        title="Nouvelle Étape"
        description="Ajouter une étape de transformation"
      >
        <UButton
          color="primary"
          variant="outline"
          block
          icon="i-heroicons-plus"
          label="Nouvelle transformation"
        />
        <template #content>
          <TransformationStepAdd :transformation="transformation" />
        </template>
      </UModal>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  purchaseId: string;
}>();
const quantityReceived = defineModel("quantityReceived");
const quantityUsed = defineModel("quantityUsed");
const quantityRemaining = defineModel("quantityRemaining");

//variables to store the transformation
const transformation = ref<Transformation | undefined>();
const transformationMetrics = computed(() => {
  // Shortcut to the value for cleaner code
  const t = transformation.value;

  return [
    {
      title: "Reçu",
      value: t?.quantity_received?.toLocaleString(),
      badgeValue: t?.unit || "kg",
      color: "gray",
    },
    {
      title: "Utilisable",
      value: t?.quantity_usable?.toLocaleString(),
      badgeValue: t?.unit || "kg",
      color: "green", // Keeping green from your HTML, or change to "gray" if preferred
    },
    {
      title: "Déchet",
      value: t?.waste_quantity?.toLocaleString(),
      badgeValue: t?.unit || "kg",
      color: (t?.waste_quantity ?? 0) > 0 ? "orange" : "gray",
    },
  ];
});
const loading = ref(true);

// initialise the requests instance
const { get, delete: del } = useApi();

// Calcul du taux de déchet
const getWasteRate = (t: Transformation) => {
  if (!t.quantity_received) return 0;
  return Math.round((t.waste_quantity / t.quantity_received) * 100);
};

async function loadTransformation() {
  // 1. Chargement des transformations
  loading.value = true;
  try {
    transformation.value = await get<Transformation>(
      `/transformations/purchase/${props.purchaseId}`,
    );
    quantityReceived.value = transformation.value.quantity_received;
    quantityUsed.value = transformation.value.total_quantity_used;
    quantityRemaining.value = transformation.value.remaining_quantity;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadTransformation();
});
</script>
