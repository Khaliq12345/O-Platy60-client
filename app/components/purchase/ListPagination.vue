<template>
  <div class="flex items-center justify-between px-4 py-3">
    <UPagination
      :page="page"
      :total="total"
      :items-per-page="limit"
      @update:page="emit('changePage', $event)"
    />

    <USelect
      :model-value="limit"
      :items="options"
      class="w-16"
      @update:model-value="onLimitChange"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: number;
  limit: number;
  total: number;
}>();

const emit = defineEmits<{
  changePage: [page: number];
  changeLimit: [limit: number];
}>();

const options = [
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const onLimitChange = (val: number) => {
  emit("changeLimit", val);
  emit("changePage", 1); // Reset à la page 1 si changement de limit
};
</script>