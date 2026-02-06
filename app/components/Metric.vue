<template>
  <div
    class="p-3 rounded-lg text-center"
    :class="[variantClass, bordered && 'border-x border-gray-100 dark:border-gray-700']"
  >
    <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">
      {{ label }}
    </span>
    <span
      class="text-lg font-bold"
      :class="valueClass"
    >
      {{ formattedValue }}
      <span v-if="unit" class="text-xs font-normal text-gray-500">{{ unit }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: number | string;
  unit?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  bordered?: boolean;
  decimals?: number;
}>();

const variantClass = computed(() => {
  const variants = {
    default: 'bg-gray-50 dark:bg-gray-800/50',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20',
  };
  return variants[props.variant || 'default'];
});

const valueClass = computed(() => {
  const classes = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };
  return classes[props.variant || 'default'];
});

const formattedValue = computed(() => {
  if (typeof props.value === 'number' && props.decimals !== undefined) {
    return props.value.toFixed(props.decimals);
  }
  return props.value || 0;
});
</script>