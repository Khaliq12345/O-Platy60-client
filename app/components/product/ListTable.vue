<template>
  <div class="mt-2 overflow-x-auto">
    <UTable
      v-model:expanded="expanded"
      :data="products"
      :columns="columns"
      class="w-full min-w-[640px]"
    >
      <template #expanded="{ row }">
        <div
          class="p-4 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50"
        >
          <div
            v-for="field in expandableFields"
            :key="String(field.key)"
            class="space-y-1"
            :class="field.colSpan ? `col-span-${field.colSpan}` : ''"
          >
            <span
              class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ field.label }}
            </span>

            <div v-if="field.isBadge">
              <UBadge
                v-if="getFieldValue(row.original, field.badgeKey || field.key)"
                :label="field.badgeLabel ? field.badgeLabel(row.original) : getFieldValue(row.original, field.badgeKey || field.key)"
                :style="field.badgeStyle ? field.badgeStyle(row.original) : undefined"
                size="sm"
              />
              <span v-else class="text-sm text-gray-500">{{ field.emptyLabel || '-' }}</span>
            </div>

            <p
              v-else-if="field.isCustom"
              class="text-sm font-medium text-gray-900 dark:text-white"
            >
              {{ field.customRender ? field.customRender(row.original) : getFieldValue(row.original, field.key) }}
            </p>

            <p
              v-else
              class="text-sm font-medium text-gray-900 dark:text-white"
              :class="field.class"
            >
              {{
                field.format
                  ? field.format(getFieldValue(row.original, field.key), row.original)
                  : getFieldValue(row.original, field.key)
              }}
            </p>
          </div>
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent, ref } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Product } from "~/types/product";
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const props = defineProps<{
  products: Product[];
  categories?: Category[];
  ingredients?: Ingredient[];
}>();

const emit = defineEmits<{
  edit: [item: Product];
  delete: [item: Product];
}>();

const expanded = ref<Record<string, boolean>>({});
const { generateColor } = useColorGenerator();

interface ExpandableField<T = any> {
  key: keyof T | string;
  label: string;
  format?: (value: any, row: T) => string;
  class?: string;
  colSpan?: number;
  isBadge?: boolean;
  badgeKey?: keyof T | string;
  badgeLabel?: (row: T) => string;
  badgeStyle?: (row: T) => Record<string, string>;
  emptyLabel?: string;
  isCustom?: boolean;
  customRender?: (row: T) => string;
}

const getFieldValue = (row: Product, key: keyof Product | string): any => {
  return row[key as keyof Product];
};

const getCategory = (categoryId?: string): Category | undefined => {
  if (!categoryId || !props.categories?.length) return undefined;
  return props.categories.find((cat) => cat.id === categoryId);
};

const getIngredient = (ingredientId?: string): Ingredient | undefined => {
  if (!ingredientId || !props.ingredients?.length) return undefined;
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
      class: "font-medium text-primary underline dark:text-white p-0 whitespace-nowrap",
      onClick: () => emit("edit", row.original),
    }, () => row.getValue("name")),
  },
  {
    accessorKey: "initial_portion",
    header: "Portion",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => h("span", { class: "whitespace-nowrap" }, `${row.getValue("initial_portion")} ${row.original.unit}`),
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
      if (!categoryId) return h("span", { class: "text-sm text-gray-500" }, "Sans catégorie");
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
    cell: ({ row }) => h("span", { class: "text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" }, getIngredientName(row.original.ingredient_id)),
  },
  {
    id: "actions",
    header: "",
    meta: { class: { th: "w-12", td: "text-right" } },
    cell: ({ row }) => h(UButton, {
      icon: "i-lucide-trash-2",
      color: "error",
      variant: "ghost",
      size: "xs",
      onClick: () => emit("delete", row.original),
    }),
  },
];
</script>