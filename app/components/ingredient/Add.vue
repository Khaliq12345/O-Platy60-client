<template>
  <UModal v-model:open="isOpen">
    <template #title>
      Nouvel Ingrédient
    </template>

    <template #body>
      <!-- Loading -->
      <div v-if="loading" class="py-12 flex items-center justify-center">
        <Loading />
      </div>

      <!-- Error -->
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

      <!-- Form -->
      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nom" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="ex: Farine de blé"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <UFormField label="Catégorie" name="category">
          <USelect
            v-model="state.category"
            :items="categoryItems"
            placeholder="Sélectionner une catégorie (optionnel)"
            class="w-full"
            :disabled="isSubmitting || loadingCategories"
            :loading="loadingCategories"
          />
        </UFormField>

        <UFormField label="Unité de mesure" name="unit" required>
          <USelect
            v-model="state.unit"
            :items="measurementItems"
            placeholder="Sélectionner une unité"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <UFormField label="Quantité totale" name="total_quantity" required>
          <UInputNumber
            v-model="state.total_quantity"
            placeholder="ex: 5000"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>
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
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || loading || loadError"
          :label="isSubmitting ? 'Enregistrement...' : 'Enregistrer'"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Category } from "~/types/category";
import { Mesurement, type IngredientCreate } from "~/types/ingredient";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { get, post } = useApi();
const toast = useToast();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const loading = ref(true);
const loadError = ref(false);
const isSubmitting = ref(false);
const loadingCategories = ref(false);

const measurementItems = [
  { label: "Kilogramme (kg)", value: Mesurement.KG },
  { label: "Gramme (g)", value: Mesurement.G },
  { label: "Litre (L)", value: Mesurement.L },
  { label: "Unité", value: Mesurement.UNIT },
  { label: "Cuillère à café (tsp)", value: Mesurement.TSP },
  { label: "Cuillère à soupe (tbsp)", value: Mesurement.TBSP },
];

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  unit: z.enum(Mesurement, {
    errorMap: () => ({ message: "Veuillez sélectionner une unité de mesure" }),
  }),
  category: z.string().optional(),
  total_quantity: z.number().min(1, "La quantité totale est requise"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  unit: undefined,
  category: undefined,
  total_quantity: 0,
});

const categories = ref<Category[]>([]);
const categoryItems = computed(() => {
  return categories.value.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
});

async function loadCategories() {
  loadingCategories.value = true;
  try {
    const response = await get<{ categories: Category[]; count: number }>(
      "/categories"
    );
    categories.value = response?.categories ?? [];
  } catch (err) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les catégories.",
      color: "error",
    });
  } finally {
    loadingCategories.value = false;
  }
}

async function loadData() {
  loading.value = true;
  loadError.value = false;
  try {
    await loadCategories();
  } catch (err) {
    loadError.value = true;
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les données.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function reloadData() {
  loadData();
}

async function onSubmit() {
  isSubmitting.value = true;
  try {
    const ingredientData: IngredientCreate = {
      name: state.name!,
      unit: state.unit!,
      category: state.category,
      total_quantity: state.total_quantity!,
    };

    await post("/ingredients", ingredientData);

    toast.add({
      title: "Succès",
      description: "L'ingrédient a été créé avec succès.",
      color: "success",
    });

    // Reset form
    state.name = "";
    state.unit = undefined;
    state.category = undefined;
    state.total_quantity = 0;

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Load data when modal opens
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    loadData();
  }
});
</script>