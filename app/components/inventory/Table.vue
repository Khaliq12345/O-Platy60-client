<template>
  <div>
    <InventoryTableDesktop class="hidden md:block" :products="products" :days="days" />
    <InventoryTableMobile class="md:hidden" :products="products" :days="days" />
  </div>
</template>

<script setup lang="ts">
import type { ProductsSummary } from "~/utils/inventoryextra";

defineProps<{
  products: ProductsSummary;
  days: string[];
}>();
</script>