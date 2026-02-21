<template>
  <div>
    <!-- Loading state -->
    <div v-if="!products" class="py-12 flex justify-center">
      <Loading />
    </div>

    <!-- Table -->
    <DataTable
      v-else
      :data="products"
      :columns="columns"
      :expandable-fields="expandableFields"
    />

    <!-- Modal d'édition -->
    <ProductEdit 
      v-model:open="isEditOpen" 
      v-model:product="selectedProduct" 
      @updated="handleUpdated" 
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Product } from "~/types/product";
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";
import type { ExpandableField } from "~/components/DataTable.vue";
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const DeleteConfirm = resolveComponent("DeleteConfirm");

const props = withDefaults(defineProps<{
  products?: Product[]; // Optionnel avec default
  categories?: Category[];
  ingredients?: Ingredient[];
}>(), {
  products: () => [], // Default empty array
  categories: () => [],
  ingredients: () => [],
});

// État pour le modal d'édition
const isEditOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

const { generateColor } = useColorGenerator();

const getCategory = (categoryId?: string): Category | undefined => {
  if (!categoryId) return undefined;
  return props.categories.find((cat) => cat.id === categoryId);
};

const getIngredient = (ingredientId?: string): Ingredient | undefined => {
  if (!ingredientId) return undefined;
  return props.ingredients.find((ing) => ing.id === ingredientId);
};

const getCategoryName = (categoryId?: string): string => {
  return getCategory(categoryId)?.name || "Sans catégorie";
};

const getIngredientName = (ingredientId?: string): string => {
  return getIngredient(ingredientId)?.name || "—";
};

const getCategoryStyle = (categoryId?: string) => {
  const category = getCategory(categoryId);
  const name = category?.name || "default";
  const { hsl } = generateColor(name, { saturation: 60, lightness: 20 });
  return { backgroundColor: hsl, color: "white" };
};

// Ouvre le modal d'édition
function openEdit(product: Product) {
  selectedProduct.value = product;
  isEditOpen.value = true;
}

// Reload après édition
function handleUpdated() {
  window.location.reload();
}

const expandableFields: ExpandableField<Product>[] = [
  { key: "initial_portion", label: "Portion Initiale" },
  { key: "unit", label: "Unité" },
  {
    key: "category",
    label: "Catégorie",
    isBadge: true,
    badgeKey: "category",
    badgeLabel: (row) => getCategoryName(row.category),
    badgeStyle: (row) => getCategoryStyle(row.category),
    emptyLabel: "Sans catégorie",
  },
  {
    key: "ingredient_id",
    label: "Ingrédient Base",
    isCustom: true,
    customRender: (row) => getIngredientName(row.ingredient_id),
    colSpan: 2,
  },
];

const columns: TableColumn<Product>[] = [
  {
    id: "expand",
    header: "",
    meta: { class: { th: "w-10 md:hidden", td: "w-10 md:hidden" } },
    cell: ({ row }) =>
      h(UButton, {
        icon: row.getIsExpanded()
          ? "i-lucide-chevron-down"
          : "i-lucide-chevron-right",
        color: "neutral",
        variant: "ghost",
        size: "xs",
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-medium whitespace-nowrap" },
        row.getValue("name"),
      ),
  },
  {
    accessorKey: "initial_portion",
    header: "Portion",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) =>
      h(
        "span",
        { class: "whitespace-nowrap" },
        `${row.getValue("initial_portion")} ${row.original.unit}`,
      ),
  },
  {
    accessorKey: "unit",
    header: "Unité",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => {
      const categoryId = row.getValue("category") as string | undefined;
      if (!categoryId)
        return h("span", { class: "text-sm text-gray-500" }, "Sans catégorie");
      return h(UBadge, {
        label: getCategoryName(categoryId),
        style: getCategoryStyle(categoryId),
        size: "sm",
      });
    },
  },
  {
    accessorKey: "ingredient_id",
    header: "Ingrédient",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) =>
      h(
        "span",
        { class: "text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" },
        getIngredientName(row.original.ingredient_id),
      ),
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
          itemId: row.original.product_id,
          apiEndpoint: "/products",
          onDeleted: () => window.location.reload(),
        }),
      ]),
  },
];
</script>