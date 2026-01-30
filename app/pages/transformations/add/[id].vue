<template>
  <div class="mx-auto container py-4 overflow-x-auto w-full">
    <div class="w-full">
      <UPageHeader>
        <template #title>
          Transformation sur
          <span class="text-primary-600 dark:text-primary-400">
            {{ purchase?.item_name }}
          </span>
        </template>
      </UPageHeader>

      <!-- CONTENT CENTRÉ -->
      <div class="flex flex-col items-center w-full mt-5">
        <!-- Loading Skeleton -->
        <div v-if="loading" class="w-full space-y-6">
          <LoadingSkeleton class="w-full"></LoadingSkeleton>
        </div>

        <!-- Error State -->
        <div v-else-if="error || !purchase" class="w-full max-w-3xl">
          <UEmpty icon="i-lucide-file" title="Cette achat n'existe pas">
            <template #actions>
              <UButton
                icon="i-lucide-arrow-up-right"
                variant="subtle"
                :to="`/purchases`"
                >Rediriger vers achats</UButton
              >
              <UButton
                icon="i-lucide-plus"
                variant="subtle"
                :to="`/purchases/add`"
                >Cree un nouvelle achat</UButton
              >
            </template>
          </UEmpty>
        </div>

        <!-- Form -->
        <div v-if="purchase" class="w-full">
          <TransformationAdd
            :purchase="purchase"
            class="shadow-lg shadow-gray-200/50 dark:shadow-black/20"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";

const route = useRoute();
const { get } = useApi();

const purchaseId = route.params.id;
const loading = ref(false);
const purchase = ref<PurchaseItem | null>(null);
const error = ref<string | null>(null);

const loadPurchase = async () => {
  try {
    loading.value = true;
    error.value = null;
    purchase.value = await get<PurchaseItem>(`/purchases/${purchaseId}`);
  } catch (err: any) {
    error.value = err?.response?._data?.message || "Achat non trouvé";
    useToast().add({
      title: "Erreur",
      description: error.value,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPurchase();
});
</script>
