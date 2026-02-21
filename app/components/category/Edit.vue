<template>
  <ModalForm
    v-model:open="isOpen"
    v-model="formState"
    title="Modifier la catégorie"
    :fields="fields"
    :schema="schema"
    submit-label="Enregistrer"
    @submit="onSubmit"
  />
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Category } from "~/types/category";
import ModalForm from "~/components/ModalForm.vue";

const props = defineProps<{
  category: Category | null;
}>();

const isOpen = defineModel("open", { default: false });
const { put } = useApi();
const toast = useToast();

const formState = ref({
  name: "",
});

const fields = [
  {
    name: "name",
    label: "Nom de la catégorie",
    type: "text",
    required: true,
    placeholder: "Entrez le nom de la catégorie",
  },
];

const schema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),
});

// Sync avec la catégorie
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    formState.value.name = newCategory.name;
  }
}, { immediate: true });

const onSubmit = async (data: any) => {
  if (!props.category) return;
  
  try {
    await put(`/categories/${props.category.id}`, { name: data.name });
    
    toast.add({
      title: "Succès",
      description: "La catégorie a été modifiée avec succès.",
      color: "success",
    });

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la modification.",
      color: "error",
    });
    throw error;
  }
};
</script>