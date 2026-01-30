<template>
  <div class="mb-6 space-y-4">
    <BackButton label="Retour" />

    <!-- Titre principal -->
    <div v-if="!loading && transformation" class="space-y-1">
      <h1
        class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight"
      >
        {{ transformation.product_name }}
      </h1>

      <NuxtLink
        v-if="transformation.purchase_id"
        :to="`/purchases/${transformation.purchase_id}`"
        class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center gap-1"
      >
        Lien vers l'achat original
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
      </NuxtLink>
    </div>
    <USkeleton v-else class="h-8 w-2/3" />

    <!-- Stats compactes intégrées -->
    <div
      v-if="!loading && transformation"
      class="pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="grid grid-cols-3 gap-4 md:gap-8">
        <!-- Reçu -->
        <div class="text-center md:text-left">
          <div
            class="flex items-center justify-center md:justify-start gap-1.5 text-gray-500 dark:text-gray-400 mb-0.5"
          >
            <UIcon name="i-heroicons-inbox" class="w-4 h-4" />
            <span class="text-xs font-medium uppercase tracking-wider"
              >Reçu</span
            >
          </div>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            {{ transformation.quantity_received }}
            <span class="text-sm font-normal text-gray-500">{{
              unit || "kg"
            }}</span>
          </p>
        </div>

        <!-- Utilisable -->
        <div class="text-center md:text-left">
          <div
            class="flex items-center justify-center md:justify-start gap-1.5 text-green-600 mb-0.5"
          >
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
            <span class="text-xs font-medium uppercase tracking-wider"
              >Utilisable</span
            >
          </div>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            {{ transformation.quantity_usable }}
            <span class="text-sm font-normal text-gray-500">{{
              unit || "kg"
            }}</span>
          </p>
          <span class="text-xs text-green-600 font-medium"
            >{{ usablePercentage }}%</span
          >
        </div>

        <!-- Déchets -->
        <div class="text-center md:text-left">
          <div
            class="flex items-center justify-center md:justify-start gap-1.5 text-red-600 mb-0.5"
          >
            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            <span class="text-xs font-medium uppercase tracking-wider"
              >Déchets</span
            >
          </div>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            {{ transformation.waste_quantity }}
            <span class="text-sm font-normal text-gray-500">{{
              unit || "kg"
            }}</span>
          </p>
          <span class="text-xs text-red-600 font-medium"
            >{{ wastePercentage }}%</span
          >
        </div>
      </div>

      <!-- Mini barre de progression -->
      <div
        class="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div
          class="bg-green-500 transition-all"
          :style="{ width: `${usablePercentage}%` }"
        />
        <div
          class="bg-red-500 transition-all"
          :style="{ width: `${wastePercentage}%` }"
        />
      </div>
      <div class="flex justify-between mt-1 text-xs">
        <span class="text-green-600 font-medium">Utilisable</span>
        <span class="text-red-600 font-medium">Déchets</span>
      </div>
    </div>

    <!-- Loading stats -->
    <div
      v-else-if="loading"
      class="pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="grid grid-cols-3 gap-4">
        <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
      </div>
      <USkeleton class="h-2 w-full mt-3" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformationSummary } from "~/types/transformation";

const props = defineProps<{
  transformation?: TransformationSummary | null;
  unit?: string; // Optionnel car pas dans TransformationSummary
  loading?: boolean;
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
</script>
