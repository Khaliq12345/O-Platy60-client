<script setup lang="ts">
import type { PurchaseSummary } from '~/types/purchase'

defineProps<{
  purchase?: PurchaseSummary | null
  loading?: boolean
}>()
</script>

<template>
  <div class="w-full max-w-3xl mx-auto mb-8 space-y-4">
    <BackButton label="Retour" />

    <div>
      <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
        <span v-if="loading">Nouvelle Transformation</span>
        <span v-else-if="purchase">
          Transformation sur 
          <span class="text-primary-600 dark:text-primary-400">
            {{ purchase.item_name }}
          </span>
        </span>
        <span v-else>Erreur de chargement</span>
      </h1>
      
      <p class="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2">
        <span v-if="loading">Récupération des données de l'achat...</span>
        <span v-else-if="purchase">
          Enregistrer une transformation pour cet achat de 
          <span class="font-medium text-gray-700 dark:text-gray-300">
            {{ purchase.remaining_quantity }} {{ purchase.unit }} disponibles
          </span>
        </span>
        <span v-else>Impossible de charger les détails de cet achat</span>
      </p>
    </div>
  </div>
</template>