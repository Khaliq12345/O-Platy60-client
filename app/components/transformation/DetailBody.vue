<template>
  <div class="space-y-4">
    <!-- Métriques en boucle -->
    <div class="grid items-center justify-center grid-cols-3 gap-4">
      <div v-for="metric in metrics" :key="metric.key">
        <MetricsWithBadge
          :title="metric.title"
          :value="metric.value"
          :badge-value="transformation?.unit || 'unit'"
          :color="metric.color"
        />
      </div>
    </div>

    <div class="space-y-1">
      <!-- Barre de progression Nuxt UI corrigée -->
      <UProgress
        :model-value="transformation?.quantity_usable || 0"
        :max="transformation?.quantity_received || 0"
        size="sm"
        status
        class="mt-3"
      />

      <!-- Labels custom sous la barre -->
      <p class="text-end text-red-600 font-medium text-sm">
        Déchets {{ wastePercentage }}%
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TransformationSummary } from "~/types/transformation";

const props = defineProps<{
  transformation?: TransformationSummary | null;
  unit?: string;
}>();

const usablePercentage = computed(() => {
  if (!props.transformation?.quantity_received) return 0;
  return Math.round(
    (props.transformation.quantity_usable /
      props.transformation.quantity_received) *
      100,
  );
});

const wastePercentage = computed(() => {
  if (!props.transformation?.quantity_received) return 0;
  return Math.round(
    (props.transformation.waste_quantity /
      props.transformation.quantity_received) *
      100,
  );
});

const metrics = computed(() => [
  {
    key: "received",
    title: "Reçu",
    value: props.transformation?.quantity_received.toString() || "0",
    color: undefined,
    showPercentage: false,
  },
  {
    key: "usable",
    title: "Utilisable",
    value: props.transformation?.quantity_usable.toString() || "0",
    color: undefined,
    showPercentage: true,
    percentage: usablePercentage.value,
    percentageColor: "text-green-600",
  },
  {
    key: "waste",
    title: "Déchet",
    value: props.transformation?.waste_quantity.toString() || "0",
    color: "red",
    showPercentage: true,
    percentage: wastePercentage.value,
    percentageColor: "text-red-600",
  },
]);
</script>