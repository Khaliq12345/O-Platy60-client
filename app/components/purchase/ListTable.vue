<template>
  <div class="mt-2">
    <UTable
      v-model:expanded="expanded"
      :data="purchases"
      :columns="columns"
      class="w-full"
    >
      <template #expanded="{ row }">
        <div
          class="p-4 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 md:hidden"
        >
          <div
            v-for="field in expandableFields"
            :key="field.key"
            class="space-y-1"
            :class="field.colSpan ? `col-span-${field.colSpan}` : ''"
          >
            <span
              class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ field.label }}
            </span>

            <!-- Cas spécial: Catégorie avec Badge -->
            <div v-if="field.isBadge && field.key === 'category_id'">
              <div v-if="row.original.category_id">
                <UBadge
                  :label="getCategoryName(row.original.category_id)"
                  :style="getCategoryStyle(row.original.category_id)"
                  size="sm"
                />
              </div>
              <span v-else class="text-sm text-gray-500">Sans catégorie</span>
            </div>

            <!-- Cas spécial: Stock (quantity + unit) -->
            <p
              v-else-if="field.isCustom && field.key === 'stock'"
              class="text-sm font-medium text-gray-900 dark:text-white"
            >
              {{ row.original.quantity }} {{ row.original.unit }}
            </p>

            <!-- Cas standard avec formatage optionnel -->
            <p
              v-else
              class="text-sm font-medium text-gray-900 dark:text-white"
              :class="field.class"
            >
              {{
                field.format
                  ? field.format(
                      row.original[field.key as keyof PurchaseItem],
                      row.original,
                    )
                  : row.original[field.key as keyof PurchaseItem]
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
import type { PurchaseItem } from "~/types/purchase";
import type { Category } from "~/types/category";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const PurchaseDelete = resolveComponent("PurchaseDelete");

const props = defineProps<{
  purchases: PurchaseItem[];
  categories?: Category[];
}>();

const emit = defineEmits<{
  editPurchase: [item: PurchaseItem];
  delete: [item: PurchaseItem];
}>();

const expanded = ref({});
const { generateColor } = useColorGenerator();

// Configuration des champs pour l'expandable mobile
interface ExpandableField {
  key: keyof PurchaseItem | "stock";
  label: string;
  format?: (value: any, row: PurchaseItem) => string;
  class?: string;
  colSpan?: number;
  isBadge?: boolean;
  isCustom?: boolean; // Pour les cas spéciaux comme catégorie/stock
}

const expandableFields: ExpandableField[] = [
  { key: "quantity", label: "Quantité" },
  {
    key: "price_per_unit",
    label: "Prix Unitaire",
    format: (val) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(Number(val)),
  },
  {
    key: "total_price",
    label: "Prix Total",
    format: (val) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(Number(val)),
    class: "text-primary-600 dark:text-primary-400 font-semibold",
  },
  {
    key: "category_id",
    label: "Catégorie",
    isBadge: true,
  },
  {
    key: "stock",
    label: "Stock Restant",
    colSpan: 2,
    isCustom: true,
  },
];

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

const columns: TableColumn<PurchaseItem>[] = [
  {
    id: "expand",
    header: "",
    meta: {
      class: {
        th: "w-10 md:hidden",
        td: "w-10 md:hidden",
      },
    },
    cell: ({ row }) => {
      return h(UButton, {
        icon: row.getIsExpanded()
          ? "i-lucide-chevron-down"
          : "i-lucide-chevron-right",
        color: "neutral",
        variant: "ghost",
        size: "xs",
        onClick: () => row.toggleExpanded(),
      });
    },
  },
  {
    accessorKey: "purchase_date",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("purchase_date")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "item_name",
    header: "Article",
    cell: ({ row }) =>
      h(
        "div",
        { class: "font-medium text-gray-900 dark:text-white" },
        row.getValue("item_name"),
      ),
  },
  {
    accessorKey: "quantity",
    header: "Qté",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
  },
  {
    accessorKey: "price_per_unit",
    header: "Prix U.",
    meta: {
      class: {
        th: "hidden md:table-cell text-right",
        td: "hidden md:table-cell text-right",
      },
    },
    cell: ({ row }) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(Number(row.getValue("price_per_unit"))),
  },
  {
    accessorKey: "total_price",
    header: "Total",
    meta: {
      class: {
        th: "hidden md:table-cell text-right",
        td: "hidden md:table-cell text-right font-semibold",
      },
    },
    cell: ({ row }) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(Number(row.getValue("total_price"))),
  },
  {
    accessorKey: "category_id",
    header: "Catégorie",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => {
      const categoryId = row.getValue("category_id") as string | undefined;
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
    id: "stock",
    header: "Stock",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
  },
  {
    id: "actions",
    header: "",
    meta: { class: { th: "w-12", td: "text-right" } },
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          content: { align: "end" },
          // We do NOT pass the 'items' prop here anymore
        },
        {
          // 1. The Trigger (Button)
          default: () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              size: "xs",
            }),
          // 2. The Custom Content (List of components)
          "content-top": () =>
            h("div", { class: "p-4 flex flex-col gap-1" }, [
              // View Action (Standard Button)
              h(UButton, {
                label: "Voir",
                icon: "i-lucide-eye",
                variant: "ghost",
                color: "neutral",
                block: true,
                class: "justify-start",
                onClick: () => navigateTo(`/purchases/${row.original.id}`),
              }),

              h("div", { class: "h-px bg-gray-200 dark:bg-gray-800 my-1" }), // Custom Separator

              // Delete component
              h(PurchaseDelete, {
                itemName: row.original.item_name,
                purchaseId: row.original.id,
              }),
            ]),
        },
      ),
  },
];
</script>
