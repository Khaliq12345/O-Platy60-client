<template>
  <div class="hidden lg:block">
    <InventoryRowDesktop :item="item" :days="days" />
  </div>
  <div class="lg:hidden">
    <InventoryRowMobile :item="item" :days="days" />
  </div>
</template>

<script setup lang="ts">
import type { Inventory } from '~/types/inventory';

interface DayValue {
  entries: number | null;
  sales: number | null;
}

defineProps<{
  item: Inventory;
  days: DayValue[];
}>();
</script>