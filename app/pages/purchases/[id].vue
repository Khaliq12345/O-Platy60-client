<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Details d'Achats"> </CustomDashboardNav>
    </template>

    <template #body>
      <div class="flex justify-center">
        <Loading v-if="loading" />
        <div v-else-if="purchase" class="md:w-[60%] md:p-6">
          <BackButton class="mb-2" />
          <PurchaseDetailHeader
            :item-name="purchase?.item_name || ''"
            :purchase-id="purchaseId || ''"
          ></PurchaseDetailHeader>

          <div class="grid grid-cols-1 gap-4 w-full">
            <PurchaseDetailInfo :purchase="purchase" />

            <PurchaseDetailTransformation :purchase="purchase" />
          </div>
        </div>
        <div v-else class="py-6">
          <UEmpty icon="i-lucide-circle-minus" title="Achats non trouvee" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";

const route = useRoute();

const purchaseId = route.params.id;

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
