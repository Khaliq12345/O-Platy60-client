<template>
  <div class="flex items-center justify-between px-4 py-3">
    <UPagination
      v-model:page="currentPage"
      :total="total"
      :items-per-page="limit"
      @update:page="$emit('changePage', currentPage)"
    />

    <USelect
      v-model="currentLimit"
      :items="options"
      class="w-16"
      @update:model-value="
        $emit('changeLimit', { limit: currentLimit, page: 1 })
      "
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number;
  limit: number;
  total: number;
}>();

const emit = defineEmits<{
  changePage: [page: number];
  changeLimit: [pageInfo: object];
}>();

const options = [
  { label: "2", value: 2 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const currentLimit = ref(props.limit);
const currentPage = ref(props.page);
</script>
