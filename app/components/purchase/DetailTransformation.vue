<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Transformations
        </h3>
        <UBadge
          :color="transformations.length > 0 ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
        >
          {{ transformations.length }}
        </UBadge>
      </div>
    </template>

    <!-- État vide -->
    <div v-if="transformations.length === 0" class="text-center py-8">
      <div class="flex flex-col items-center gap-3">
        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
          <UIcon
            name="i-heroicons-cube-transparent"
            class="w-6 h-6 text-gray-400"
          />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Aucune transformation enregistrée
        </p>
      </div>
    </div>

    <!-- Liste des transformations -->
    <div v-else class="space-y-3">
      <div
        v-for="transformation in sortedTransformations"
        :key="transformation.id"
        class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <!-- Ligne principale : Nom + Date -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">
              {{ transformation.product_name }}
            </h4>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ formatDate(transformation.transformation_date) }}
            </p>
          </div>
          <UButton
            :to="`/transformation/${transformation.id}`"
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-eye"
            label="Voir"
          />
        </div>

        <!-- Quantités en grille -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-white dark:bg-gray-900 rounded px-2 py-1.5">
            <p class="text-xs text-gray-500">Reçu</p>
            <p class="font-semibold text-sm text-gray-900 dark:text-white">
              {{ transformation.quantity_received }}
            </p>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded px-2 py-1.5">
            <p class="text-xs text-gray-500">Utilisable</p>
            <p class="font-semibold text-sm text-green-600">
              {{ transformation.quantity_usable }}
            </p>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded px-2 py-1.5">
            <p class="text-xs text-gray-500">Déchet</p>
            <p
              class="font-semibold text-sm"
              :class="
                transformation.waste_quantity > 0
                  ? 'text-orange-600'
                  : 'text-gray-400'
              "
            >
              {{ transformation.waste_quantity }}
            </p>
          </div>
        </div>

        <!-- Indicateur de perte si significatif -->
        <div
          v-if="getWasteRate(transformation) > 5"
          class="mt-2 flex items-center gap-1.5 text-xs text-orange-600"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5" />
          <span>{{ getWasteRate(transformation) }}% de perte</span>
        </div>
      </div>
    </div>

    <!-- Bouton d'action toujours visible -->
    <template #footer>
      <UButton
        color="primary"
        variant="outline"
        block
        icon="i-heroicons-plus"
        label="Nouvelle transformation"
        :to="`/transformation/add/${purchaseId}`"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  purchaseId: string;
  transformations: Transformation[];
}>();

// Tri par date décroissante (plus récente en premier)
const sortedTransformations = computed(() => {
  return [...props.transformations].sort(
    (a, b) =>
      new Date(b.transformation_date).getTime() -
      new Date(a.transformation_date).getTime(),
  );
});

// Format date court
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
};

// Calcul du taux de déchet
const getWasteRate = (t: Transformation) => {
  if (!t.quantity_received) return 0;
  return Math.round((t.waste_quantity / t.quantity_received) * 100);
};
</script>
