<template>
  <div
    class="w-full flex items-center justify-between px-4 sm:px-6 py-3 h-16 max-w-7xl mx-auto"
  >
    <!-- Pagination centrale -->
    <UPagination
      v-model:page="page"
      :total="totalItems"
      :items-per-page="itemsPerPage"
      :sibling-count="isMobile ? 0 : 1"
      :show-edges="!isMobile"
      size="sm"
      class="flex-1 justify-center sm:justify-center"
      @update:page="handlePageChange"
    />

    <!-- Contrôle droite -->
    <div class="flex items-center gap-2 sm:gap-3 min-w-fit">
      <span class="hidden sm:text-xs text-gray-500 dark:text-gray-400"
        >Par page</span
      >
      <USelect
        v-model="itemsPerPage"
        :items="perPageOptions"
        size="sm"
        class="w-14 sm:w-20"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}>();

const emit = defineEmits<{
  "update:currentPage": [page: number];
  "update:itemsPerPage": [count: number];
}>();

// Détection mobile (< 640px)
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);

// Pagination state
const page = computed({
  get: () => props.currentPage,
  set: (val) => emit("update:currentPage", val),
});

const itemsPerPage = computed({
  get: () => props.itemsPerPage,
  set: (val) => {
    emit("update:itemsPerPage", val);
    emit("update:currentPage", 1);
  },
});

const perPageOptions = [
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

function handlePageChange(newPage: number) {
  emit("update:currentPage", newPage);
  // Scroll doux vers le haut de la liste
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
