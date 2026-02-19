<template>
  <ModalForm
    v-model:open="isOpen"
    title="Nouveau Produit"
    :fields="fields"
    :schema="schema"
    submit-label="Créer"
    @submit="onSubmit"
  />
</template>

<script setup lang="ts">
import { z } from "zod";
import { Measurement, measurementOptions } from "~/utils/measurements";
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";
import type { ProductCreate } from "~/types/product";

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

// Données injectées
const categories = inject<Ref<Category[]>>("categories", ref([]));
const ingredients = inject<Ref<Ingredient[]>>("ingredients", ref([]));

// Configuration des champs
const fields = computed(() => [
  {
    name: "name",
    label: "Nom",
    type: "text" as const,
    required: true,
    placeholder: "ex: Sandwich Poulet",
  },
  {
    name: "initial_portion",
    label: "Portion initiale",
    type: "number" as const,
    required: true,
    placeholder: "ex: 150",
    min: 0,
    step: 0.1,
    class: "sm:grid-cols-2",
  },
  {
    name: "unit",
    label: "Unité",
    type: "select" as const,
    required: true,
    placeholder: "Sélectionner",
    options: measurementOptions,
    class: "sm:grid-cols-2",
  },
  {
    name: "category",
    label: "Catégorie",
    type: "select" as const,
    placeholder: "Sélectionner une catégorie (optionnel)",
    options: [
      { label: "Aucune", value: undefined },
      ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
    ],
  },
  {
    name: "ingredient_id",
    label: "Ingrédient de base",
    type: "select" as const,
    required: true,
    placeholder: "Sélectionner un ingrédient",
    options: ingredients.value.map((ing) => ({ label: ing.name, value: ing.id })),
  },
]);

// Schema Zod
const schema = z.object({
  name: z.string("Le nom est requis"),
  initial_portion: z.number("La portion doit être supérieure à 0"),
  unit: z.enum(Measurement, "La selection d'une unité est requise"),
  category: z.string().optional(),
  ingredient_id: z.string("Un ingrédient est requis"),
});

// Soumission
async function onSubmit(data: any) {
  try {
    const productData: ProductCreate = {
      name: data.name,
      initial_portion: data.initial_portion,
      unit: data.unit.toLowerCase(),
      category: data.category,
      ingredient_id: data.ingredient_id,
    };

    await post("/products", productData);

    toast.add({
      title: "Succès",
      description: "Produit créé avec succès",
      color: "success",
    });

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de créer le produit",
      color: "error",
    });
  }
}
</script>