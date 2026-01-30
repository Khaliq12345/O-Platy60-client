<template>
  <UCard class="">
    <template #header>
      <SectionHeader title="Détails de l'achat">
        <UBadge :color="stockColor" variant="subtle" size="sm">
          {{ remainingPercentage }}% disponible
        </UBadge>
      </SectionHeader>
    </template>

    <!-- // Show this when data is loading -->

    <Loading v-if="loading" />

    <!-- // Show this if there's no purchase -->
    <div v-else-if="!purchase" class="py-6">
      <UEmpty icon="i-lucide-circle-minus" title="Achats non trouvee" />
    </div>

    <!-- // Show this is there's purchase -->
    <div v-else class="space-y-6">
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

        <div class="grid grid-cols-2 gap-4">
          <MetricsWithIcon
            v-for="metric in inventoryMetrics"
            :key="metric.title"
            :title="metric.title"
            :value="metric.value"
            :icon="metric.icon"
            direction="horizontal"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";
import MetricsWithBadge from "../MetricsWithBadge.vue";

const props = defineProps<{
  purchaseId: string;
  quantityReceived?: number;
  quantityUsed?: number;
  quantityRemaining?: number;
}>();
const itemName = defineModel();

const purchase = ref<PurchaseItem>();

// initialise the requests instance
const { get, delete: del } = useApi();

// variables to store data
const loading = ref<boolean>(true);
const toast = useToast();

// Computed pour les statistiques
const usedPercentage = computed(() => {
  // Use ?? 0 to handle undefined/null safely
  const total = props.quantityReceived ?? 0;
  const used = props.quantityUsed ?? 0;

  if (total === 0) return 0;

  return Math.round((used / total) * 100);
});

const remainingPercentage = computed(() => {
  const total = props.quantityReceived ?? 0;
  const remaining = props.quantityRemaining ?? 0;

  if (total === 0) return 0;

  return Math.round((remaining / total) * 100);
});

// Couleur dynamique selon le stock restant
const stockColor = computed(() => {
  if (remainingPercentage.value < 10) return "error";
  if (remainingPercentage.value < 30) return "warning";
  return "success";
});

// Formatage date avec VueUse (ou native)
const formattedDate = computed(() => {
  return new Date(purchase.value?.purchase_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const inventoryMetrics = computed(() => [
  {
    title: "Utilisé",
    value: `${props.quantityUsed || 0} ${purchase.value?.unit}`,
    icon: "i-heroicons-arrow-down-circle",
    color: "text-orange-500", // Optional: add flavor to your JSON
  },
  {
    title: "Restant",
    value: `${props.quantityRemaining || 0} ${purchase.value?.unit}`,
    icon: "i-heroicons-archive-box",
    color: "text-green-500",
  },
]);

const metadataItems = computed(() => [
  {
    title: "Date d'achat",
    value: formattedDate.value,
    icon: "i-heroicons-calendar-days",
  },
  // {
  //   title: "Créé par",
  //   value: purchase.value?.created_by,
  //   icon: "i-heroicons-user",
  // },
]);

const purchaseMetrics = computed(() => {
  const p = purchase.value;
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

async function loadPurchase() {
  loading.value = true;
  try {
    // 1. Chargement de l'achat d'abord
    purchase.value = await get<PurchaseItem>(`/purchases/${props.purchaseId}`);

    itemName.value = purchase.value?.item_name;
  } catch (error: any) {
    console.error("Erreur chargement:", error);

    toast.add({
      title: "error",
      description:
        error?.data?.message || "Erreur lors du chargement des données",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadPurchase();
});
</script>
