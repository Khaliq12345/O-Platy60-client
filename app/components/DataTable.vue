<template>
  <div class="mt-2">
    <UTable
      v-model:expanded="expanded"
      :data="data"
      :columns="columns"
      class="w-full"
    >
      <template #expanded="{ row }">
        <div
          class="p-4 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 md:hidden"
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
              <div v-if="getFieldValue(row.original, field.badgeKey || field.key)">
                <UBadge
                  :label="field.badgeLabel ? field.badgeLabel(row.original) : getFieldValue(row.original, field.badgeKey || field.key)"
                  :style="field.badgeStyle ? field.badgeStyle(row.original) : undefined"
                  size="sm"
                />
              </div>
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

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref } from "vue";
import type { TableColumn } from "@nuxt/ui";

export interface ExpandableField<T = any> {
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

const props = defineProps<{
  data: T[];
  columns: TableColumn<T>[];
  expandableFields: ExpandableField<T>[];
}>();

const expanded = ref<Record<string, boolean>>({});

const getFieldValue = (row: T, key: keyof T | string): any => {
  return row[key as keyof T];
};
</script>