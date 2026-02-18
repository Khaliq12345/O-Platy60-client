<template>
  <UCard class="">
    <template #header>
      <SectionHeader title="Détails de l'achat">
      </SectionHeader>
    </template>

    <!-- // Show this is there's purchase -->
    <div class="space-y-6">
      <!-- Grille d'infos principales -->
      <div class="grid grid-cols-3 gap-4 flex-row">
        <div v-for="metric in purchaseMetrics">
          <MetricsWithBadge
            :title="metric.title"
            :value="metric.value.toString()"
            :badgeValue="metric.badgeValue"
            :color="metric.color"
          ></MetricsWithBadge>
        </div>
      </div>

      <USeparator />

      <!-- Métadonnées -->
      <div class="grid grid-cols-2 gap-4">
        <MetricsWithIcon
          v-for="(item, index) in metadataItems"
          :key="index"
          :title="item.title"
          :value="item.value"
          :icon="item.icon"
          direction="vertical"
        />
      </div>

    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";
import MetricsWithBadge from "../MetricsWithBadge.vue";

const props = defineProps<{
  purchase: PurchaseItem;
}>();

// Formatage date avec VueUse (ou native)
const formattedDate = computed(() => {
  return new Date(props.purchase?.purchase_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const metadataItems = computed(() => [
  {
    title: "Date d'achat",
    value: formattedDate.value,
    icon: "i-heroicons-calendar-days",
  },
]);

const purchaseMetrics = computed(() => {
  const p = props.purchase;
  return [
    {
      title: "Quantité",
      value: p?.quantity?.toString() || "0",
      badgeValue: p?.unit || "kg",
      direction: "horizontal", // Style 1
      icon: "i-heroicons-scale",
      color: "gray",
    },
    {
      title: "Prix Unitaire",
      value: p?.price_per_unit?.toLocaleString("fr-FR") || "0",
      badgeValue: "FCFA",
      direction: "horizontal",
      icon: "i-heroicons-tag",
      color: "gray",
    },
    {
      title: "Prix Total",
      value: p?.total_price?.toLocaleString("fr-FR") || "0",
      badgeValue: "FCFA",
      color: "red",
      direction: "horizontal",
      icon: "i-heroicons-banknotes",
    },
  ];
});
</script>
