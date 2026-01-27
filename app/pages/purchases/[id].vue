<script setup lang="ts">
import type { PurchaseDetail } from "~/types/purchase";

const route = useRoute();
const router = useRouter();
const { get, delete: del } = useApi();

const purchaseId = computed(() => route.params.id as string);
const purchase = ref<PurchaseDetail | null>(null);
const loading = ref(true);

async function loadPurchase() {
  try {
    loading.value = true;
    purchase.value = await get<PurchaseDetail>(
      `/purchases/${purchaseId.value}`,
    );
  } catch (error) {
    console.error("Erreur chargement achat:", error);
  } finally {
    loading.value = false;
  }
}

function handleEdit() {
  router.push(`/purchases/${purchaseId.value}/edit`);
}

async function handleDelete() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet achat ?")) return;

  try {
    await del(`/purchases/${purchaseId.value}`);
    router.push("/purchases");
  } catch (error) {
    console.error("Erreur suppression:", error);
  }
}

function handleBack() {
  router.push("/purchases");
}

function handleCreateSection() {
  router.push(`/purchases/${purchaseId.value}/transformation/new`);
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
        @edit="handleEdit"
        @delete="handleDelete"
        @back="handleBack"
      />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PurchaseDetailInfo :purchase="purchase" />
        <PurchaseDetailTransformation
          :is-transformed="purchase.is_transformed"
          @create-section="handleCreateSection"
        />
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-500">Achat non trouvé</div>
  </div>
</template>
