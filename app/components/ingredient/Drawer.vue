<script setup lang="ts">
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";

const props = defineProps<{
  item: PurchaseItem;
}>();

const open = ref(false);

const category = ref<Category | null>()

const detailFields = computed(() => [
  { label: "Nom", value: props.item.item_name },
  { label: "Quantité", value: `${props.item.quantity} ${props.item.unit}` },
  {
    label: "Prix total",
    value: props.item.total_price.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    }),
  },
  {
    label: "Prix unitaire",
    value: props.item.price_per_unit.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    }),
  },
  { label: "Catégorie", value: category.value?.name || "Sans catégorie" },
  {
    label: "Date d'achat",
    value: new Date(props.item.purchase_date).toLocaleDateString("fr-FR"),
  },
  { label: "Notes", value: props.item.notes || "Aucune note" },
  { label: "Créé par", value: props.item.created_by },
]);

onMounted(async () => {
  const { get } = useApi()
  if (props.item.category_id) {
    category.value = await get<Category>(`/categories/${props.item.category_id}`)
  }
})
</script>

<template>
  <UDrawer
    :open="open"
    direction="right"
    :handle="false"
    :dismissible="false"
    :ui="{
      content: 'md:max-w-md w-full rounded-none',
    }"
  >
    <UButton
      variant="ghost"
      trailing-icon="i-lucide-chevron-right"
      @click="open = true"
    />

    <template #header>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Détails de l'achat
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
        {{ item.item_name }}
      </p>
    </template>

    <template #body>
      <!-- Contenu scrollable -->
      <div class="h-full overflow-y-auto pr-2 space-y-4">
        <div
          v-for="(field, index) in detailFields"
          :key="index"
          class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
        >
          <p
            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
          >
            {{ field.label }}
          </p>
          <p class="text-base text-gray-900 dark:text-white font-medium">
            {{ field.value }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="grid gap-2 grid-cols-3">
        <UButton
          block
          color="primary"
          variant="soft"
          icon="i-heroicons-pencil-square"
          label="Modifier"
        />

        <UButton
          block
          color="error"
          variant="soft"
          icon="i-heroicons-trash"
          label="Supprimer"
        />

        <UButton
          block
          color="neutral"
          variant="soft"
          icon="i-heroicons-x-mark"
          label="Fermer"
          @click="open = false"
        />
      </div>
    </template>
  </UDrawer>
</template>
