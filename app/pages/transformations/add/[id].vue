<script setup lang="ts">
import type { PurchaseSummary } from "~/types/purchase";

const route = useRoute();
const { get } = useApi();

const purchaseId = computed(() => route.params.id as string);
const loading = ref(true);
const purchase = ref<PurchaseSummary | null>(null);
const error = ref<string | null>(null);

const loadPurchase = async () => {
  try {
    loading.value = true;
    error.value = null;
    purchase.value = await get<PurchaseSummary>(
      `/purchases/${purchaseId.value}/summary`,
    );
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

<template>
  <div class="mx-auto py-4 overflow-scroll">
    <div class="container mx-auto px-4">
      <TransformationAddHeader :purchase="purchase" :loading="loading" />

      <!-- CONTENT CENTRÉ -->
      <div class="flex flex-col items-center w-full">
        <!-- Loading Skeleton -->
        <div v-if="loading" class="w-full max-w-3xl space-y-6">
          <UCard class="shadow-sm">
            <template #header>
              <div class="space-y-3">
                <USkeleton class="h-7 w-1/3" />
                <USkeleton class="h-4 w-1/4" />
              </div>
            </template>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <USkeleton
                  v-for="i in 2"
                  :key="i"
                  class="h-12 w-full rounded-lg"
                />
              </div>

              <div class="space-y-3 pt-4">
                <USkeleton class="h-5 w-32" />
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <USkeleton
                    v-for="i in 3"
                    :key="i"
                    class="h-12 w-full rounded-lg"
                  />
                </div>
                <USkeleton class="h-4 w-full rounded-full" />
              </div>

              <USkeleton class="h-28 w-full rounded-lg" />

              <div class="flex justify-end gap-3 pt-4">
                <USkeleton class="h-10 w-24 rounded-lg" />
                <USkeleton class="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Error State -->
        <div v-else-if="error || !purchase" class="w-full max-w-3xl">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            class="shadow-sm"
          >
            <template #title> Achat introuvable </template>
            <template #description>
              {{ error || "Cet achat n'existe pas ou a été supprimé." }}
            </template>
            <template #actions>
              <UButton
                to="/purchases"
                color="error"
                variant="solid"
                size="sm"
                icon="i-heroicons-arrow-left"
              >
                Retour aux achats
              </UButton>
            </template>
          </UAlert>
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
