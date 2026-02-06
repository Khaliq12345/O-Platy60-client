<template>
  <div
    class="space-y-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4"
  >
    <!-- Header -->
    <div class="flex items-center gap-3 mb-3">
      <!-- Numéro d'étape -->
      <span
        class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-bold text-sm"
      >
        {{ stepNumber }}
      </span>

      <!-- Titre -->
      <h4 class="font-semibold text-gray-900 dark:text-white">
        {{ step.step_name }}
      </h4>
    </div>

    <!-- Contenu -->
    <div class="space-y-2">
      <!-- Date -->
      <MetricsWithIcon
        title="Date"
        :value="formatDateTime(step.created_at)"
        icon="i-lucide-calendar"
        direction="vertical"
      />

      <!-- Stats en grille -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Portions -->
        <div
          class="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Portions</p>
          <p class="text-lg font-bold text-green-600">
            {{ step.portions }}
          </p>
        </div>

        <!-- Quantité -->
        <div class="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantité</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            {{ step.quantity }} {{ unit || "kg" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformationStep } from "~/types/transformation";

const props = defineProps<{
  step: TransformationStep;
  stepNumber: number;
  unit?: string;
}>();

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
