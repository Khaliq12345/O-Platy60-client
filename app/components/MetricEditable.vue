<!-- components/MetricEditable.vue -->
<template>
  <div class="relative group">
    <!-- Mode Affichage -->
    <div v-if="!isEditing" class="cursor-pointer" @click="toggleEdit">
      <MetricsWithBadge
        :title="title"
        :value="displayValue"
        :badge-value="badgeValue"
        :color="color"
      />
      <span
        v-if="showPercentage && percentage !== undefined"
        class="text-xs font-medium"
        :class="percentageColor"
      >
        {{ percentage }}%
      </span>
      
      <!-- Bouton edit qui apparaît au hover -->
      <UButton
        icon="i-heroicons-pencil"
        size="xs"
        color="gray"
        variant="ghost"
        class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="toggleEdit"
      />
    </div>

    <!-- Mode Édition -->
    <div v-else class="space-y-2">
      <UFormField :label="title">
        <UInput
          v-model="localValue"
          type="number"
          :placeholder="title"
          size="sm"
        >
          <template #trailing>
            <span class="text-gray-500 text-xs">{{ badgeValue }}</span>
          </template>
        </UInput>
      </UFormField>
      
      <div class="flex gap-2 justify-end">
        <UButton
          icon="i-heroicons-check"
          size="xs"
          color="green"
          variant="soft"
          @click="save"
        />
        <UButton
          icon="i-heroicons-x-mark"
          size="xs"
          color="red"
          variant="soft"
          @click="cancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: string | number;
  badgeValue: string;
  color?: string;
  modelValue?: number;
  showPercentage?: boolean;
  percentage?: number;
  percentageColor?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
  'save': [value: number, key: string];
}>();

const isEditing = ref(false);
const localValue = ref<number>(Number(props.modelValue ?? props.value) || 0);

const displayValue = computed(() => props.value.toString());

const toggleEdit = () => {
  localValue.value = Number(props.modelValue ?? props.value) || 0;
  isEditing.value = true;
};

const save = () => {
  emit('save', localValue.value, props.title.toLowerCase());
  emit('update:modelValue', localValue.value);
  isEditing.value = false;
};

const cancel = () => {
  isEditing.value = false;
  localValue.value = Number(props.modelValue ?? props.value) || 0;
};
</script>