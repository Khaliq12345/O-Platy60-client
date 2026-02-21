<template>
  <DataTable
    :data="ingredients"
    :columns="columns"
    :expandable-fields="expandableFields"
  />
  
  <!-- Modal d'édition intégré -->
  <IngredientEdit
    v-model:open="isEditOpen"
    :ingredient="selectedIngredient"
  />
</template>

<script setup lang="ts">
import { h, resolveComponent, ref } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Ingredient } from "~/types/ingredient";
import type { Category } from "~/types/category";
import type { ExpandableField } from "~/components/DataTable.vue";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const DeleteConfirm = resolveComponent("DeleteConfirm");

const props = defineProps<{
  ingredients: Ingredient[];
  categories?: Category[];
}>();

// État pour le modal d'édition
const isEditOpen = ref(false);
const selectedIngredient = ref<Ingredient | null>(null);

const { generateColor } = useColorGenerator();

const getCategory = (categoryId?: string): Category | undefined => {
  if (!categoryId || !props.categories?.length) return undefined;
  return props.categories.find((cat) => cat.id === categoryId);
};

const getCategoryName = (categoryId?: string): string => {
  return getCategory(categoryId)?.name || "Sans catégorie";
};

const getCategoryStyle = (categoryId?: string) => {
  const category = getCategory(categoryId);
  const name = category?.name || "default";
  const { hsl } = generateColor(name, { saturation: 60, lightness: 20 });
  return { backgroundColor: hsl, color: "white" };
};

// Ouvre le modal d'édition
function openEdit(ingredient: Ingredient) {
  selectedIngredient.value = ingredient;
  isEditOpen.value = true;
}

const expandableFields: ExpandableField<Ingredient>[] = [
  { key: "unit", label: "Unité" },
  { 
    key: "total_quantity", 
    label: "Quantité Totale", 
    isCustom: true,
    customRender: (row) => `${row.total_quantity} ${row.unit}`
  },
  { 
    key: "category", 
    label: "Catégorie", 
    isBadge: true,
    badgeKey: "category",
    badgeLabel: (row) => getCategoryName(row.category),
    badgeStyle: (row) => getCategoryStyle(row.category),
    emptyLabel: "Sans catégorie"
  },
  {
    key: "created_at",
    label: "Date de création",
    format: (val) => new Date(val).toLocaleDateString("fr-FR"),
    colSpan: 2,
  },
];

const columns: TableColumn<Ingredient>[] = [
  {
    id: "expand",
    header: "",
    meta: { class: { th: "w-10 md:hidden", td: "w-10 md:hidden" } },
    cell: ({ row }) => h(UButton, {
      icon: row.getIsExpanded() ? "i-lucide-chevron-down" : "i-lucide-chevron-right",
      color: "neutral",
      variant: "ghost",
      size: "xs",
      onClick: () => row.toggleExpanded(),
    }),
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => h(UButton, {
      variant: "link",
      color: "neutral",
      class: "font-medium text-primary underline dark:text-white p-0",
      onClick: () => navigateTo(`/purchases?ingredient=${encodeURIComponent(row.original.name)}`),
    }, () => row.getValue("name")),
  },  
  {
    accessorKey: "total_quantity",
    header: "Quantité",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => `${row.original.total_quantity} ${row.original.unit}`,
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => {
      const categoryId = row.getValue("category") as string | undefined;
      if (!categoryId) return h("span", { class: "text-sm text-gray-500" }, "Sans catégorie");
      return h(UBadge, {
        label: getCategoryName(categoryId),
        style: getCategoryStyle(categoryId),
        size: "sm",
      });
    },
  },
  {
    accessorKey: "created_at",
    header: "Créé le",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString("fr-FR"),
  },
  {
    id: "actions",
    header: "",
    meta: { class: { th: "w-24", td: "text-right" } },
    cell: ({ row }) =>
      h("div", { class: "flex items-center justify-end gap-2" }, [
        // Bouton d'édition
        h(UButton, {
          icon: "i-lucide-pencil",
          color: "primary",
          variant: "ghost",
          size: "xs",
          onClick: () => openEdit(row.original),
        }),
        // Bouton de suppression
        h(DeleteConfirm, {
          itemName: row.original.name,
          itemId: row.original.id,
          apiEndpoint: "/ingredients",
          onDeleted: () => window.location.reload(),
        }),
      ]),
  },
];
</script>