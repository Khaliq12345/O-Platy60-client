<script setup lang="ts">
import type { PurchaseSummary } from "~/types/purchase";
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  purchase: PurchaseSummary;
  transformations: Transformation[];
}>();

// Computed pour les statistiques
const usedPercentage = computed(() => {
  return Math.round(
    (props.purchase.total_used_quantity / props.purchase.quantity) * 100,
  );
});

const remainingPercentage = computed(() => {
  return Math.round(
    (props.purchase.remaining_quantity / props.purchase.quantity) * 100,
  );
});

// Couleur dynamique selon le stock restant
const stockColor = computed(() => {
  if (remainingPercentage.value < 10) return "error";
  if (remainingPercentage.value < 30) return "warning";
  return "success";
});

// Formatage date avec VueUse (ou native)
const formattedDate = computed(() => {
  return new Date(props.purchase.purchase_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});
</script>

<template>
  <UCard class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Détails de l'achat
        </h2>
        <UBadge :color="stockColor" variant="subtle" size="md">
          {{ remainingPercentage }}% disponible
        </UBadge>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Grille d'infos principales -->
      <div class="grid grid-cols-3 gap-4">
        <div class="space-y-1">
          <p class="text-sm text-gray-500 dark:text-gray-400">Quantité</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ purchase.quantity }}
            </span>
            <UBadge color="neutral" variant="soft" size="sm">
              {{ purchase.unit }}
            </UBadge>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-sm text-gray-500 dark:text-gray-400">Prix Unitaire</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ purchase.price_per_unit.toLocaleString("fr-FR") }}
            <span class="text-sm font-normal text-gray-500">FCFA</span>
          </p>
        </div>

        <div class="space-y-1">
          <p class="text-sm text-gray-500 dark:text-gray-400">Prix Total</p>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ purchase.total_price.toLocaleString("fr-FR") }}
            <span class="text-sm font-normal text-gray-500">FCFA</span>
          </p>
        </div>
      </div>

      <USeparator />

      <!-- Métadonnées -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <UIcon
              name="i-heroicons-calendar-days"
              class="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Date d'achat</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ formattedDate }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <UIcon
              name="i-heroicons-user"
              class="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Créé par</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ purchase.created_by || "Non attribué" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Statut du Stock avec Progress -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3
            class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
          >
            État du Stock
          </h3>
          <span class="text-sm text-gray-500">
            Total: {{ purchase.quantity }} {{ purchase.unit }}
          </span>
        </div>
        <UProgress
          v-model="usedPercentage"
          :max="100"
          :color="stockColor"
          size="lg"
        />

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <span
              class="text-gray-600 dark:text-gray-400 flex items-center gap-2"
            >
              <UIcon
                name="i-heroicons-arrow-down-circle"
                class="w-4 h-4 text-amber-500"
              />
              Utilisé
            </span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ purchase.total_used_quantity }} {{ purchase.unit }}
            </span>
          </div>

          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <span
              class="text-gray-600 dark:text-gray-400 flex items-center gap-2"
            >
              <UIcon
                name="i-heroicons-archive-box"
                class="w-4 h-4"
                :class="`text-${stockColor}-500`"
              />
              Restant
            </span>
            <span
              class="font-semibold"
              :class="`text-${stockColor}-600 dark:text-${stockColor}-400`"
            >
              {{ purchase.remaining_quantity }} {{ purchase.unit }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <UAlert
        v-if="purchase.notes"
        icon="i-heroicons-chat-bubble-left-ellipsis"
        :title="purchase.notes"
        color="neutral"
        variant="soft"
        class="mt-4"
      />

      <div
        v-else
        class="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg"
      >
        Aucune note disponible
      </div>
    </div>

    <!-- Slot pour actions (optionnel) -->
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </UCard>
</template>
