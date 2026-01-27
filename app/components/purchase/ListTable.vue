<template>
  <UCard>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              class="text-left text-sm py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Date
            </th>
            <th
              class="text-left text-sm px-4 font-semibold text-gray-900 dark:text-white"
            >
              Article
            </th>
            <th
              class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Quantité
            </th>
            <th
              class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Prix Unitaire
            </th>
            <th
              class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Prix Total
            </th>
            <th
              class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Catégorie
            </th>
            <th
              class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Stock Restant
            </th>
            <th
              class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <PurchaseListCard
            v-for="purchase in purchases"
            :key="purchase.id"
            :item="purchase"
            :categories="categories"
            @view="emit('view', $event)"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
          />
        </tbody>
      </table>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";
import type { Category } from "~/types/category";

const props = defineProps<{
  purchases: PurchaseItem[];
  categories: Category[];
}>();

const emit = defineEmits<{
  view: [item: PurchaseItem];
  edit: [item: PurchaseItem];
  delete: [item: PurchaseItem];
}>();
</script>
