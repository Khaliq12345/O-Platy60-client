<template>
  <UModal v-model:open="isOpen">
    <template #title>{{ title }}</template>

    <template #body>
      <!-- Loading state -->
      <div v-if="loading" class="py-12 flex items-center justify-center">
        <Loading />
      </div>

      <!-- Error state -->
      <div
        v-else-if="loadError"
        class="py-12 flex flex-col items-center justify-center px-4"
      >
        <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mb-4" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h2>
        <p class="text-gray-500 text-center mb-4 text-sm">
          Impossible de charger les données nécessaires.
        </p>
        <UButton
          color="primary"
          icon="i-lucide-refresh-cw"
          label="Réessayer"
          @click="reloadData"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="isEmpty && $slots.empty">
        <slot name="empty" />
      </div>

      <!-- Form -->
      <UForm
        v-else
        :schema="schema"
        :state="formState"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <div
          v-for="field in fields"
          :key="field.name"
          :class="field.class || ''"
        >
          <UFormField :label="field.label" :name="field.name" :required="field.required">
            <!-- Input text -->
            <UInput
              v-if="field.type === 'text'"
              v-model="formState[field.name]"
              :placeholder="field.placeholder"
              class="w-full"
              :disabled="isSubmitting"
            />

            <!-- Input number -->
            <UInputNumber
              v-else-if="field.type === 'number'"
              v-model="formState[field.name]"
              :placeholder="field.placeholder"
              :min="field.min"
              :step="field.step"
              class="w-full"
              :disabled="isSubmitting"
            />

            <!-- Select -->
            <USelect
              v-else-if="field.type === 'select'"
              v-model="formState[field.name]"
              :items="getSelectItems(field)"
              :placeholder="field.placeholder"
              class="w-full"
              :disabled="isSubmitting || field.loading"
              :loading="field.loading"
            />

            <!-- Textarea -->
            <UTextarea
              v-else-if="field.type === 'textarea'"
              v-model="formState[field.name]"
              :placeholder="field.placeholder"
              :rows="field.rows || 3"
              class="w-full"
              :disabled="isSubmitting"
            />
          </UFormField>
        </div>

        <!-- Slot pour contenu personnalisé après les champs -->
        <slot name="after-fields" />
      </UForm>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="soft"
          label="Annuler"
          :disabled="isSubmitting"
          @click="isOpen = false"
        />
        <UButton
          v-if="!isEmpty"
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || loading || loadError || !isFormValid"
          :label="isSubmitting ? 'Enregistrement...' : submitLabel"
          @click="handleSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
// Types pour la configuration des champs
type FieldType = "text" | "number" | "select" | "textarea";

interface SelectOption {
  label: string;
  value: any;
}

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  class?: string;
  options?: SelectOption[] | (() => SelectOption[] | Ref<SelectOption[]>);
  loading?: boolean;
  min?: number;
  step?: number;
  rows?: number;
}

// Props
const props = defineProps<{
  open: boolean;
  title: string;
  fields: FieldConfig[];
  schema: any;
  submitLabel?: string;
  loading?: boolean;
  loadError?: boolean;
  isEmpty?: boolean;
  modelValue?: Record<string, any>;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:modelValue": [value: Record<string, any>];
  submit: [data: any];
  reload: [];
}>();

// Sync avec v-model:open
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

// État local du formulaire
const formState = reactive<Record<string, any>>({});

// État de soumission
const isSubmitting = ref(false);

// Sync depuis props vers local (init)
watch(() => props.modelValue, (val) => {
  if (val) Object.assign(formState, val);
}, { immediate: true, deep: true });

// Sync depuis local vers parent (à chaque changement)
watch(formState, (val) => {
  emit("update:modelValue", { ...val });
}, { deep: true });

// Init du form state
function initFormState() {
  props.fields.forEach((field) => {
    const defaultValue = field.type === "number" ? 0 : undefined;
    formState[field.name] = props.modelValue?.[field.name] ?? defaultValue;
  });
}

// Récupère les items pour un select
function getSelectItems(field: FieldConfig): SelectOption[] {
  if (!field.options) return [];
  if (typeof field.options === "function") {
    const result = field.options();
    return isRef(result) ? result.value : result;
  }
  return field.options;
}

// Validation du form via le schema
const isFormValid = computed(() => {
  try {
    props.schema.parse(formState);
    return true;
  } catch {
    return false;
  }
});

// Soumission
async function handleSubmit() {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  try {
    emit("submit", { ...formState });
    isOpen.value = false;
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
}

// Reset du formulaire
function resetForm() {
  initFormState();
}

// Rechargement des données
function reloadData() {
  emit("reload");
}

// Watch l'ouverture pour init
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    initFormState();
  }
});
</script>