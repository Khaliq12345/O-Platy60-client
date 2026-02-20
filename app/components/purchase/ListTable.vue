<template>
  <DataTable
    :data="purchases"
    :columns="columns"
    :expandable-fields="expandableFields"
  />
</template>

<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { PurchaseItem } from "~/types/purchase";
import type { Category } from "~/types/category";
import type { ExpandableField } from "~/components/DataTable.vue";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const DeleteConfirm = resolveComponent("DeleteConfirm");

const props = defineProps<{
  purchases: PurchaseItem[];
  categories?: Category[];
}>();

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

const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
}).format(Number(val));

const expandableFields: ExpandableField<PurchaseItem>[] = [
  { key: "quantity", label: "Quantité" },
  { 
    key: "price_per_unit", 
    label: "Prix Unitaire",
    format: (val) => formatCurrency(val)
  },
  { 
    key: "total_price", 
    label: "Prix Total",
    format: (val) => formatCurrency(val),
    class: "text-primary-600 dark:text-primary-400 font-semibold"
  },
  { 
    key: "category_id", 
    label: "Catégorie", 
    isBadge: true,
    badgeKey: "category_id",
    badgeLabel: (row) => getCategoryName(row.category_id),
    badgeStyle: (row) => getCategoryStyle(row.category_id),
    emptyLabel: "Sans catégorie"
  },
  { 
    key: "stock", 
    label: "Stock Restant", 
    colSpan: 2,
    isCustom: true,
    customRender: (row) => `${row.quantity} ${row.unit}`
  },
];

const columns: TableColumn<PurchaseItem>[] = [
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
    accessorKey: "purchase_date",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("purchase_date")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "item_name",
    header: "Ingrédient",
    cell: ({ row }) => h("div", { class: "font-medium text-gray-900 dark:text-white" }, row.getValue("item_name")),
  },
  {
    accessorKey: "quantity",
    header: "Qté",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
  },
  {
    accessorKey: "price_per_unit",
    header: "Prix U.",
    meta: { class: { th: "hidden md:table-cell text-right", td: "hidden md:table-cell text-right" } },
    cell: ({ row }) => formatCurrency(row.getValue("price_per_unit")),
  },
  {
    accessorKey: "total_price",
    header: "Total",
    meta: { class: { th: "hidden md:table-cell text-right", td: "hidden md:table-cell text-right font-semibold" } },
    cell: ({ row }) => formatCurrency(row.getValue("total_price")),
  },
  {
    accessorKey: "category_id",
    header: "Catégorie",
    meta: { class: { th: "hidden md:table-cell", td: "hidden md:table-cell" } },
    cell: ({ row }) => {
      const categoryId = row.getValue("category_id") as string | undefined;
      if (!categoryId) return h("span", { class: "text-sm text-gray-500" }, "Sans catégorie");
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
    cell: ({ row }) => h(UDropdownMenu, { content: { align: "end" } }, {
      default: () => h(UButton, {
        icon: "i-lucide-ellipsis-vertical",
        color: "neutral",
        variant: "ghost",
        size: "xs",
      }),
      "content-top": () => h("div", { class: "p-4 flex flex-col gap-1" }, [
        h(UButton, {
          label: "Voir",
          icon: "i-lucide-eye",
          variant: "ghost",
          color: "neutral",
          block: true,
          class: "justify-start",
          onClick: () => navigateTo(`/purchases/${row.original.id}`),
        }),
        h("div", { class: "h-px bg-gray-200 dark:bg-gray-800 my-1" }),
        h(DeleteConfirm, {
          itemName: row.original.item_name,
          itemId: row.original.id,
          apiEndpoint: "/purchases",
          triggerLabel: "Supprimer",
          onDeleted: () => window.location.reload(),
        }),
      ]),
    }),
  },
];
</script>