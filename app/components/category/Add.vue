<template>
  <UCollapsible class="flex flex-col gap-2 mx-4">
    <UButton
      class="font-medium"
      color="primary"
      variant="subtle"
      :trailing-icon="open ? 'i-lucide-minus' : 'i-lucide-plus'"
      block
      @click="open = !open"
    >
      Ajouter une catégorie
    </UButton>

    <template #content>
      <UForm
        :schema="schema"
        :state="state"
        @submit="onSubmit"
        class="p-4 border rounded-lg border-default bg-gray-50/50 dark:bg-gray-800/50"
      >
        <UFormField label="Nom de la catégorie" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Entrez le nom de la catégorie"
            class="w-full"
          />
        </UFormField>

        <div class="mt-4 flex justify-center">
          <UButton 
            type="submit" 
            color="primary" 
            :loading="processing"
          >
            Créer la catégorie
          </UButton>
        </div>
      </UForm>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{
  added: [];
}>();

const { post } = useApi();
const toast = useToast();

const open = ref(false);
const processing = ref(false);

// Schéma de validation Zod
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

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  processing.value = true;
  try {
    await post("/categories", { 
      name: event.data.name,
    });
    
    toast.add({
      title: "Succès",
      description: "La catégorie a été créée avec succès.",
      color: "success",
    });

    // Reset du formulaire
    state.name = "";
    
    emit("added");
    open.value = false;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création de la catégorie.",
      color: "error",
    });
  } finally {
    processing.value = false;
  }
};
</script>