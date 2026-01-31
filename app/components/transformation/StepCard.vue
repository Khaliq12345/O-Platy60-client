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

<template>
  <div
    class="p-4 space-y-2 border rounded-lg border-gray-500/50 dark:border-gray-400/50 hover:shadow-md transition-shadow"
  >
    <div class="flex gap-2 items-center">
      <p class="text-primary-600 dark:text-primary-400 font-bold text-xl">
        #{{ stepNumber }}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ formatDateTime(step.created_at) }}
      </p>
    </div>

    <div
      class="flex flex-col justify-between md:flex-row md:items-center gap-2"
    >
      <!-- Nom de l'étape -->
      <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
        {{ step.step_name }}
      </h4>

      <!-- Stats -->
      <div class="flex items-center gap-2 text-sm md:justify-end">
        <p class="text-gray-500 dark:text-gray-400 text-xs">Portions:</p>
        <p class="font-semibold text-green-600">
          {{ step.portions }}
        </p>

        <p class="text-gray-500 dark:text-gray-400 text-xs">Quantité:</p>
        <p class="font-semibold text-gray-900 dark:text-white">
          {{ step.quantity }}
          {{ unit || "kg" }}
        </p>
      </div>
    </div>
  </div>
</template>
