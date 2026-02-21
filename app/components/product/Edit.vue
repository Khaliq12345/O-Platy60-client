<template>
  <ModalForm
    v-model:open="isOpen"
    v-model="formState"
    title="Modifier le Produit"
    :fields="fields"
    :schema="schema"
    submit-label="Enregistrer"
    :loading="loading"
    :load-error="loadError"
    @submit="onSubmit"
    @reload="loadDependencies"
  />
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";
import { Measurement, type Product, type ProductUpdate } from "~/types/product";

const emit = defineEmits<{
  updated: [];
}>();

const isOpen = defineModel<boolean>("open");
const product = defineModel<Product>("product");

const { put } = useApi();
const toast = useToast();

// États de chargement des dépendances
const loading = ref(false);
const loadError = ref(false);

// Données injectées
const categories = inject<Ref<Category[]>>("categories", ref([]));
const ingredients = inject<Ref<Ingredient[]>>("ingredients", ref([]));

// État du formulaire
const formState = ref<Record<string, any>>({});

// Options pour les selects
const unitOptions = [
  { label: "Kilogramme (kg)", value: Measurement.KG },
  { label: "Gramme (g)", value: Measurement.G },
  { label: "Litre (L)", value: Measurement.L },
  { label: "Unité", value: Measurement.UNIT },
  { label: "Cuillère à café (tsp)", value: Measurement.TSP },
  { label: "Cuillère à soupe (tbsp)", value: Measurement.TBSP },
];

const categoryOptions = computed(() => [
  { label: "Aucune", value: undefined },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);

const ingredientOptions = computed(() =>
  ingredients.value.map((ing) => ({ label: ing.name, value: ing.id }))
);

// Configuration des champs
const fields = computed(() => [
  {
    name: "name",
    label: "Nom",
    type: "text",
    required: true,
    placeholder: "ex: Sandwich Poulet",
  },
  {
    name: "initial_portion",
    label: "Portion initiale",
    type: "number",
    required: true,
    min: 0.1,
    step: 0.1,
    placeholder: "ex: 150",
    class: "col-span-1",
  },
  {
    name: "unit",
    label: "Unité",
    type: "select",
    required: true,
    options: unitOptions,
    class: "col-span-1",
  },
  {
    name: "category",
    label: "Catégorie",
    type: "select",
    required: false,
    placeholder: "Sélectionner une catégorie (optionnel)",
    options: categoryOptions.value,
  },
  {
    name: "ingredient_id",
    label: "Ingrédient de base",
    type: "select",
    required: true,
    placeholder: "Sélectionner un ingrédient",
    options: ingredientOptions.value,
    // Note: disabled géré via le composant ModalForm si besoin
  },
]);

// Schema Zod aligné avec ProductUpdate du backend
const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  initial_portion: z.number().min(0.1, "La portion doit être supérieure à 0"),
  unit: z.enum(Measurement),
  category: z.string().optional(), // Peut être null/undefined pour "Aucune"
  ingredient_id: z.string("L'ingrédient est requis"),
});

// Chargement des dépendances (catégories, ingrédients)
async function loadDependencies() {
  loading.value = true;
  loadError.value = false;
  
  try {
    // Si les données sont déjà injectées et chargées, on considère que c'est OK
    // Sinon, vous pouvez ajouter ici un fetch explicite
    if (categories.value.length === 0 || ingredients.value.length === 0) {
      // Optionnel: déclencher un événement pour charger les données côté parent
      // ou fetch direct si vous avez les endpoints
      loadError.value = true;
    }
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

// Sync avec le produit à éditer
watch(
  () => product.value,
  (newProduct) => {
    if (newProduct) {
      formState.value = {
        name: newProduct.name,
        initial_portion: newProduct.initial_portion,
        unit: newProduct.unit,
        category: newProduct.category,
        ingredient_id: newProduct.ingredient_id,
      };
    }
  },
  { immediate: true }
);

// Soumission
async function onSubmit(data: any) {
  if (!product.value?.product_id) return;

  try {
    // Payload aligné avec ProductUpdate du backend
    const payload: ProductUpdate = {
      name: data.name,
      initial_portion: data.initial_portion,
      unit: data.unit,
      category: data.category || undefined, // Convertit null/undefined
    };

    await put(`/products/${product.value.product_id}`, payload);

    toast.add({
      title: "Succès",
      description: "Produit mis à jour",
      color: "success",
    });

    isOpen.value = false;
    emit("updated");
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de mettre à jour le produit",
      color: "error",
    });
    throw error; // Remonte l'erreur pour que ModalForm gère l'état
  }
}

// Init au montage
onMounted(() => {
  loadDependencies();
});
</script>