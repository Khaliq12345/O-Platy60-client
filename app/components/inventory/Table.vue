<template>
  <div>
    <!-- Desktop view -->
    <InventoryTableDesktop
      class="hidden md:block"
      :items="items"
      :days="days"
      :transactions="transactions"
    />

    <!-- Mobile view -->
    <InventoryTableMobile
      class="md:hidden"
      :items="items"
      :days="days"
      :transactions="transactions"
    />
  </div>
</template>

<script setup lang="ts">
import type { Inventory, DayData, DailyTransactionSummary } from "~/types/inventory";

defineProps<{
  items: Inventory[];
  days: DayData[];
  transactions: Record<string, DailyTransactionSummary[]>;
}>();
</script>