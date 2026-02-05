<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Details d'Achats"> </CustomDashboardNav>
    </template>

    <template #body>
      <Loading v-if="loading" />
      <div v-else-if="purchase" class="w-full md:p-6 p-2 overflow-scroll">
        <PurchaseDetailHeader
          :item-name="purchase?.item_name || ''"
          :purchase-id="purchaseId"
          ></PurchaseDetailHeader>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <PurchaseDetailInfo
            :purchase="purchase"
          />

          <PurchaseDetailTransformation
            :purchase-id="purchaseId"
            :purchase="purchase"
            v-model:quantity-received="quantity_received"
            v-model:quantity-used="quantity_used"
            v-model:quantity-remaining="quantity_remaining"
          />
        </div>
      </div>
      <div v-else class="py-6">
        <UEmpty icon="i-lucide-circle-minus" title="Achats non trouvee" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";

const route = useRoute();

const purchaseId = route.params.id;
const quantity_received = ref(0);
const quantity_used = ref(0);
const quantity_remaining = ref(0);
const itemName = ref("");
const { get } = useApi();

const loading = ref(true);
const purchase = ref<PurchaseItem | null>(null);
const toast = useToast();

async function loadPurchase() {
  loading.value = true;
  try {
    // 1. Chargement de l'achat d'abord
    purchase.value = await get<PurchaseItem>(`/purchases/${purchaseId}`);
  } catch (error: any) {
    console.error("Erreur chargement:", error);
    toast.add({
      title: "error",
      description:
        error?.data?.message || "Erreur lors du chargement des données",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  }
   loading.value = false;
}

onMounted(async () => {
  await loadPurchase();
});
</script>
