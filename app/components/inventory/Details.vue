<template>
  <UCollapsible v-model:open="isOpen">
    <template #content>
      <div
        class="px-4 pb-4 pt-2 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800"
      >
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl"
          >
            <div class="text-xs text-gray-500 uppercase mb-1">
              {{ stat.label }}
            </div>

            <UInputNumber
              v-if="stat.isInput"
              v-model="stat.value"
              :min="0"
              size="lg"
              class="w-24 mx-auto"
              color="primary"
            />

            <div v-else class="text-2xl font-semibold" :class="stat.color">
              {{ stat.value ?? "—" }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>("open", { default: false });

const stats = ref([
  {
    label: "Total ventes",
    value: null,
    color: "text-rose-500",
    isInput: false,
  },
  {
    label: "Stock final",
    value: null,
    color: "text-primary",
    isInput: false,
  },
  {
    label: "Inventaire",
    value: null,
    isInput: true,
  },
  {
    label: "Écart",
    value: null,
    color: "text-gray-900 dark:text-white",
    isInput: false,
  },
]);
</script>
