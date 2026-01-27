<script setup lang="ts">
import type { PurchaseDetail } from "~/types/purchase";

defineProps<{
  purchase: PurchaseDetail;
}>();
</script>

<template>
  <UCard class="h-full">
    <div class="space-y-6">
      <!-- Catégorie -->
      <UBadge color="primary" variant="subtle" class="rounded-full">
        {{ purchase.category_name }}
      </UBadge>

      <!-- Nom -->
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ purchase.item_name }}
      </h2>

      <!-- Grille d'infos -->
      <div
        class="grid grid-cols-3 gap-4 border-t border-b border-gray-200 dark:border-gray-700 py-4"
      >
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Quantité</p>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ purchase.quantity }} {{ purchase.unit }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Prix Unitaire</p>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ purchase.price_per_unit.toLocaleString("fr-FR") }} FCFA
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Prix Total</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ purchase.total_price.toLocaleString("fr-FR") }} FCFA
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Date</p>
          <p class="text-base text-gray-900 dark:text-white">
            {{
              new Date(purchase.purchase_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Utilisateur</p>
          <p class="text-base text-gray-900 dark:text-white">
            {{ purchase.created_by_name }}
          </p>
        </div>
      </div>

      <!-- Statut du Stock -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Statut du Stock
        </h3>

        <div class="flex rounded-lg overflow-hidden mb-2">
          <div
            class="bg-gray-200 dark:bg-gray-700 px-3 py-2 text-sm"
            :style="{
              width: `${(purchase.used_quantity / purchase.quantity) * 100}%`,
            }"
          >
            Utilisé: {{ purchase.used_quantity }}{{ purchase.unit }}
          </div>
          <div
            class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-2 text-sm font-medium"
            :style="{
              width: `${(purchase.remaining_quantity / purchase.quantity) * 100}%`,
            }"
          >
            Restant: {{ purchase.remaining_quantity }}{{ purchase.unit }}
          </div>
        </div>

        <div class="text-right text-sm text-gray-500">
          Total: {{ purchase.quantity }}{{ purchase.unit }}
        </div>
      </div>

      <!-- Notes -->
      <div
        v-if="purchase.notes"
        class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
      >
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </p>
        <p class="text-gray-600 dark:text-gray-400">{{ purchase.notes }}</p>
      </div>
    </div>
  </UCard>
</template>
