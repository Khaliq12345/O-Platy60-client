<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Details d'ingrédient"> </CustomDashboardNav>
    </template>

    <template #body>
      <Loading v-if="loading" />
      <div v-else-if="purchase" class="w-full md:p-6 p-2 overflow-scroll">
        <IngredientDetailHeader
          :item-name="purchase?.item_name || ''"
          :purchase-id="purchaseId || ''"
        ></IngredientDetailHeader>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <IngredientDetailInfo :purchase="purchase" />

          <IngredientDetailTransformation :purchase="purchase" />
        </div>
      </div>
      <div v-else class="py-6">
        <UEmpty icon="i-lucide-circle-minus" title="Ingrédients non trouvee" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PurhcaseItem } from "~/types/purchase";

const route = useRoute();

const purchaseId = route.params.id;

const { get } = useApi();

const loading = ref(true);
const purchase = ref<PurchaseItem | null>(null);
const toast = useToast();

async function loadIngredient() {
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
  await loadIngredient();
});
</script>
