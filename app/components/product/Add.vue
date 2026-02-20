<template>
  <ModalForm
    v-model:open="isOpen"
    v-model:modelValue="formData"
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

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [boolean] }>();

const { post } = useApi();
const toast = useToast();

const isOpen = computed({ get: () => props.open, set: (v) => emit("update:open", v) });

const categories = inject<Ref<Category[]>>("categories", ref([]));
const ingredients = inject<Ref<Ingredient[]>>("ingredients", ref([]));
const formData = ref<Record<string, any>>({});

const fields = computed(() => [
  { name: "name", label: "Nom", type: "text" as const, required: true, placeholder: "ex: Sandwich Poulet" },
  { name: "initial_portion", label: "Portion initiale", type: "number" as const, required: true, 
    placeholder: "ex: 150", min: 0, step: 0.1, class: "sm:grid-cols-2" },
  { name: "unit", label: "Unité", type: "select" as const, required: true, 
    placeholder: "Sélectionner", options: measurementOptions, class: "sm:grid-cols-2" },
  { name: "category", label: "Catégorie", type: "select" as const, placeholder: "Sélectionner une catégorie",
    options: [{ label: "Aucune", value: undefined }, ...categories.value.map(c => ({ label: c.name, value: c.id }))] },
  { name: "ingredient_id", label: "Ingrédient de base", type: "select" as const, required: true,
    placeholder: "Sélectionner un ingrédient", options: ingredients.value.map(i => ({ label: i.name, value: i.id })) },
]);

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  initial_portion: z.number().min(0.1, "La portion est requise"),
  unit: z.enum(Measurement),
  category: z.string().optional(),
  ingredient_id: z.string().min(1, "Un ingrédient est requis"),
});

async function onSubmit(data: any) {
  try {
    await post("/products", {
      name: data.name,
      initial_portion: data.initial_portion,
      unit: data.unit.toLowerCase(),
      category: data.category,
      ingredient_id: data.ingredient_id,
    } as ProductCreate);

    toast.add({ title: "Succès", description: "Produit créé", color: "success" });
    isOpen.value = false;
    window.location.reload();
  } catch {
    toast.add({ title: "Erreur", description: "Création échouée", color: "error" });
  }
}
</script>