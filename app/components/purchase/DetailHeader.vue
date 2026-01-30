<template>
  <BackButton class="mb-2" />
  <div
    class="px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
  >
    <div>
      <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {{ itemName }}
      </h1>
    </div>

    <div class="flex gap-3">
      <PurchaseEdit :purchase-id="purchaseId" />
      <PurchaseDelete :item-name="itemName" :purchase-id="purchaseId" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  itemName: string;
  purchaseId: string;
}>();
</script>
