<template>
  <ModalForm
    v-model:open="isOpen"
    v-model="formState"
    title="Nouvelle catégorie"
    :fields="fields"
    :schema="schema"
    submit-label="Créer"
    @submit="onSubmit"
  />
</template>

<script setup lang="ts">
import { z } from "zod";
import ModalForm from "~/components/ModalForm.vue";

const isOpen = defineModel<boolean>("open");
const { post } = useApi();
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

const onSubmit = async (data: any) => {
  try {
    await post("/categories", { name: data.name });
    
    toast.add({
      title: "Succès",
      description: "La catégorie a été créée avec succès.",
      color: "success",
    });

    // Reset et reload
    formState.value.name = "";
    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
    throw error;
  }
};
</script>