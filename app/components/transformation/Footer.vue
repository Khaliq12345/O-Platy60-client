<template>
  <div class="grid grid-cols-3 gap-3">
    <!-- Total Portions -->
    <Metric
      label="Portions"
      :value="transformation.total_portions"
      variant="default"
    />

    <!-- Total Quantité -->
    <Metric
      label="Quantité"
      :value="transformation.total_quantity_used"
      :unit="transformation.unit"
      variant="default"
      :decimals="2"
      bordered
    />

    <!-- Stock Restant -->
    <Metric
      label="Restant"
      :value="transformation.remaining_quantity"
      :unit="transformation.unit"
      :variant="isLowStock ? 'danger' : 'success'"
      :decimals="2"
    />
  </div>
</template>

<script setup lang="ts">
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  transformation: Transformation;
}>();

const isLowStock = computed(() => props.transformation.remaining_quantity < 0.5);
</script>