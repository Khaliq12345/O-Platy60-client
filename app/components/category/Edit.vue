<template>
  <UModal
    v-model:open="isOpen"
    title="Modifier la catégorie"
    description="Modifiez les informations de la catégorie"
  >
    <template #content>
      <UForm
        v-if="category"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
        class="p-4 space-y-4"
      >
        <UFormField label="Nom de la catégorie" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Entrez le nom de la catégorie"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
          >
            Annuler
          </UButton>
          <UButton 
            type="submit" 
            color="primary" 
            :loading="processing"
          >
            Enregistrer
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Category } from "~/types/category";

const props = defineProps<{
  category: Category | null;
}>();

const emit = defineEmits<{
  updated: [];
}>();

const isOpen = defineModel("open", { default: false });
const { put } = useApi();
const toast = useToast();

const processing = ref(false);

// Schéma de validation
const schema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),
});

type Schema = z.output<typeof schema>;

// État du formulaire
const state = reactive<Partial<Schema>>({
  name: "",
});

// Synchroniser l'état avec la catégorie sélectionnée
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    state.name = newCategory.name;
  }
}, { immediate: true });

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (!props.category) return;
  
  processing.value = true;
  try {
    await put(`/categories/${props.category.id}`, {
      name: event.data.name,
    });
    
    toast.add({
      title: "Succès",
      description: "La catégorie a été modifiée avec succès.",
      color: "success",
    });

    emit("updated");
    isOpen.value = false;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la modification.",
      color: "error",
    });
  } finally {
    processing.value = false;
  }
};
</script>