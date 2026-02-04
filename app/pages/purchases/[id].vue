<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Details d'Achats"> </CustomDashboardNav>
    </template>

    <template #body>
      <div class="w-full md:p-6 p-2 overflow-scroll">
        <PurchaseDetailHeader
          :item-name="itemName"
          :purchase-id="purchaseId"
        ></PurchaseDetailHeader>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <PurchaseDetailInfo
            :purchase-id="purchaseId"
            v-model="itemName"
            :quantity-received="quantity_received"
            :quantity-used="quantity_used"
            :quantity-remaining="quantity_remaining"
          />

          <PurchaseDetailTransformation
            :purchase-id="purchaseId"
            v-model:quantity-received="quantity_received"
            v-model:quantity-used="quantity_used"
            v-model:quantity-remaining="quantity_remaining"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute();

const purchaseId = route.params.id;
const quantity_received = ref(0);
const quantity_used = ref(0);
const quantity_remaining = ref(0);
const itemName = ref("");
</script>
