<template>
  <div class="space-y-4">
    <BackButton label="Retour" />

    <!-- Titre principal -->
    <div class="space-y-1">
      <h1
        class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight"
      >
        {{ transformation?.product_name }}
      </h1>

      <NuxtLink
        :to="`/purchases/${transformation?.purchase_id}`"
        class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center gap-1"
      >
        Lien vers l'achat original
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
      </NuxtLink>
    </div>
    

    <!-- Stats compactes intégrées -->
    <div
      class="p-4"
    >
      <div class="grid grid-cols-3 gap-4">
        <!-- Reçu -->
        <MetricsWithBadge
          title="Reçu"
          :value="transformation?.quantity_received.toString() || '0'"
          :badge-value="transformation?.unit || 'unit'"
        />

        <!-- Utilisable -->
        <div class="">
          <MetricsWithBadge
            title="Utilisable"
            :value="transformation?.quantity_usable.toString() || '0'"
            :badge-value="transformation?.unit || 'unit'"
          />
          <span class="text-xs text-green-600 font-medium">
            {{ usablePercentage }}%
          </span>
        </div>

        <!-- Déchets -->
        <div class="">
          <MetricsWithBadge
            title="Déchet"
            :value="transformation?.waste_quantity.toString() || '0'"
            :badge-value="transformation?.unit || 'unit'"
            color="red"
          />
          <span class="text-xs text-red-600 font-medium">
            {{ wastePercentage }}%
          </span>
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
  </div>
</template>

<script setup lang="ts">
import type { TransformationSummary } from "~/types/transformation";

const props = defineProps<{
  transformation?: TransformationSummary | null;
  unit?: string; // Optionnel car pas dans TransformationSummary
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
