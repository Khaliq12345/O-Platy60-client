<template>
  <ModalForm
    v-model:open="isOpen"
    title="Nouvel Ingrédient"
    :fields="fields"
    :schema="schema"
    :loading="loading"
    :load-error="loadError"
    submit-label="Enregistrer"
    @submit="onSubmit"
    @reload="loadData"
  />
</template>

<script setup lang="ts">
import { z } from "zod";
import { Measurement, measurementOptions } from "~/utils/measurements";
import { loadCategories } from "~/utils/categories";
import type { Category } from "~/types/category";
import type { IngredientCreate } from "~/types/ingredient";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { post } = useApi();
const toast = useToast();

// Sync open
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

// État chargement
const loading = ref(true);
const loadError = ref(false);

// Données
const categories = ref<Category[]>([]);

// Chargement des données
async function loadData() {
  loading.value = true;
  loadError.value = false;
  try {
    categories.value = await loadCategories(toast);
  } catch (err) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les catégories.",
      color: "error",
    });
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

// Configuration des champs
const fields = computed(() => [
  {
    name: "name",
    label: "Nom",
    type: "text" as const,
    required: true,
    placeholder: "ex: Farine de blé",
  },
  {
    name: "category",
    label: "Catégorie",
    type: "select" as const,
    placeholder: "Sélectionner une catégorie (optionnel)",
    options: categories.value.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })),
    loading: loading.value,
  },
  {
    name: "unit",
    label: "Unité de mesure",
    type: "select" as const,
    required: true,
    placeholder: "Sélectionner une unité",
    options: measurementOptions,
  },
  {
    name: "total_quantity",
    label: "Quantité totale",
    type: "number" as const,
    required: true,
    placeholder: "ex: 5000",
  },
]);

// Schema Zod
const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  unit: z.enum(Measurement),
  category: z.string().optional(),
  total_quantity: z.number().min(1, "La quantité totale est requise"),
});

// Soumission
async function onSubmit(data: any) {
  try {
    const ingredientData: IngredientCreate = {
      name: data.name,
      unit: data.unit.toLowerCase(),
      category: data.category,
      total_quantity: data.total_quantity,
    };

    await post("/ingredients", ingredientData);

    toast.add({
      title: "Succès",
      description: "L'ingrédient a été créé avec succès.",
      color: "success",
    });

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
  }
}

// Chargement à l'ouverture
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    loadData();
  }
});
</script>