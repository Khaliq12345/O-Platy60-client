<script setup lang="ts">
import type { PurchaseSummary } from "~/types/purchase";
import type { Transformation } from "~/types/transformation";
const route = useRoute();
const { get, delete: del } = useApi();

const purchaseId = computed(() => route.params.id as string);
const purchase = ref<PurchaseSummary | null>(null);
const loading = ref(true);
const transformations = ref<Transformation[]>([])
const toast = useToast()

async function loadPurchase() {
  if (!purchaseId.value) return
  loading.value = true
  transformations.value = [] // Reset
  
  try {
    // 1. Chargement de l'achat d'abord
    purchase.value = await get<PurchaseSummary>(
      `/purchases/${purchaseId.value}/summary`
    )
    
    // 2. Puis chargement des transformations
    if (purchase.value?.id) {
      transformations.value = await get<Transformation[]>(
        '/transformations',
        {
          purchase_id: purchaseId.value
        }
      ) || []
    }
    
  } catch (error: any) {
    console.error("Erreur chargement:", error)
    
    toast.add({
      title: 'error',
      description: error?.data?.message || 'Erreur lors du chargement des données',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    
    purchase.value = null
    transformations.value = []
    
  } finally {
    loading.value = false
  }
}
onMounted(loadPurchase);
</script>

<template>
  <div class="w-full p-6 overflow-scroll">
    <!-- Loading avec Skeleton -->
    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-12 w-full" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
    </div>

    <template v-else-if="purchase">
      <PurchaseDetailHeader
        :item-name="purchase.item_name"
      />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PurchaseDetailInfo :purchase="purchase" :transformations="transformations"/>
        <PurchaseDetailTransformation
          :purchase-id="purchaseId"
          :transformations="transformations"
        />
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-500">Achat non trouvé</div>
  </div>
</template>
