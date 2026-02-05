<template>
  <UCollapsible class="w-full">
    <!-- Header (toujours visible) -->
    <div
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
    >
      <div class="flex items-center gap-3">
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

      <!-- Chevron animé -->
      <UIcon
        name="i-lucide-chevron-down"
        class="w-5 h-5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </div>

    <!-- Contenu (visible quand ouvert) -->
    <template #content>
      <div class="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100 dark:border-gray-800">
        <!-- Date -->
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-500 dark:text-gray-400">
            {{ formatDateTime(step.created_at) }}
          </span>
        </div>

        <!-- Stats en grille -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Portions -->
          <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Portions</p>
            <p class="text-lg font-bold text-green-600">
              {{ step.portions }}
            </p>
          </div>

          <!-- Quantité -->
          <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantité</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ step.quantity }} {{ unit || "kg" }}
            </p>
          </div>
        </div>

        <!-- Description si présente -->
        <div v-if="step.description" class="text-sm text-gray-600 dark:text-gray-300">
          {{ step.description }}
        </div>
      </div>
    </template>
  </UCollapsible>
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