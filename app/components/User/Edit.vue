<template>
  <UModal
    v-model:open="isOpen"
    title="Modifier le profil"
    description="Mettez à jour vos informations personnelles"
  >
    <template #content>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nom complet" name="full_name" required>
          <UInput
            v-model="state.full_name"
            placeholder="Votre nom complet"
            icon="i-heroicons-user"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
          <UButton
            color="neutral"
            variant="ghost"
            label="Annuler"
            @click="isOpen = false"
          />
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            label="Enregistrer"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const emit = defineEmits<{
  updated: [];
}>();

const { put } = useApi();
const auth = useAuthStore();
const toast = useToast();

const isOpen = defineModel("open", { default: false });
const loading = ref(false);

// Schema only validates what we're actually editing
const schema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  full_name: auth.user?.full_name ?? ""
});

// Reset form when modal opens
watch(isOpen, (open) => {
  if (open) {
    state.full_name = auth.user?.full_name ?? "";
  }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!auth.user?.id) return;
  
  loading.value = true;
  try {
    await put<User>(`/users/${auth.user.id}`, {
      full_name: event.data.full_name,
    });
    
    toast.add({
      title: "Succès",
      description: "Profil mis à jour avec succès",
      color: "success",
    });
    
    emit("updated");
    isOpen.value = false;
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: error.message || "Impossible de mettre à jour le profil",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>