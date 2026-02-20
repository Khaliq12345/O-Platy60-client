<template>
  <ModalForm
    v-model:open="isOpen"
    v-model:modelValue="formData"
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

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [boolean] }>();

const { post } = useApi();
const toast = useToast();

const isOpen = computed({ get: () => props.open, set: (v) => emit("update:open", v) });

const loading = ref(false);
const loadError = ref(false);
const categories = ref<Category[]>([]);
const formData = ref<Record<string, any>>({});

async function loadData() {
  loading.value = true;
  try {
    categories.value = await loadCategories(toast);
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

const fields = computed(() => [
  { name: "name", label: "Nom", type: "text" as const, required: true, placeholder: "ex: Farine de blé" },
  { name: "category", label: "Catégorie", type: "select" as const, placeholder: "Sélectionner une catégorie", 
    options: categories.value.map(c => ({ label: c.name, value: c.id })), loading: loading.value },
  { name: "unit", label: "Unité de mesure", type: "select" as const, required: true, 
    placeholder: "Sélectionner une unité", options: measurementOptions },
  { name: "total_quantity", label: "Quantité totale", type: "number" as const, required: true, placeholder: "ex: 5000" },
]);

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  unit: z.enum(Measurement),
  category: z.string().optional(),
  total_quantity: z.number().min(1, "La quantité est requise"),
});

async function onSubmit(data: any) {
  try {
    await post("/ingredients", {
      name: data.name,
      unit: data.unit.toLowerCase(),
      category: data.category,
      total_quantity: data.total_quantity,
    } as IngredientCreate);

    toast.add({ title: "Succès", description: "Ingrédient créé", color: "success" });
    isOpen.value = false;
    window.location.reload();
  } catch {
    toast.add({ title: "Erreur", description: "Création échouée", color: "error" });
  }
}

watch(() => props.open, (open) => open && loadData());
</script> 