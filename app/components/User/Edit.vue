<template>
  <UModal
    v-model:open="isOpen"
    title="Modifier le profil"
    description="Confirmez votre identité pour modifier vos informations"
  >
    <template #content>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="onSubmit"
      >
        <!-- Section modifications -->
        <div class="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Nouvelles informations
          </h3>
          
          <UFormField label="Nom complet" name="full_name" required>
            <UInput
              v-model="state.full_name"
              placeholder="Votre nom complet"
              icon="i-heroicons-user"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="votre@email.com"
              icon="i-heroicons-envelope"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Section vérification -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
            Vérification requise
          </h3>
          
          <UFormField 
            label="Mot de passe actuel" 
            name="current_password" 
            required
            help="Entrez votre mot de passe pour confirmer les changements"
          >
            <UInput
              v-model="state.current_password"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              class="w-full"
            />
          </UFormField>
        </div>

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
            label="Enregistrer les modifications"
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

const schema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.email("Email invalide"),
  current_password: z.string().min(1, "Le mot de passe est requis pour confirmer"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  full_name: auth.user?.full_name ?? "",
  email: auth.user?.email ?? "",
  current_password: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!auth.user?.id || !auth.user?.email) return;
  
  loading.value = true;
  try {
    await put<User>(`/users/${auth.user.id}`, {
      full_name: event.data.full_name,
      email: event.data.email,
      current_email: auth.user.email,
      password: event.data.current_password,
    });
    
    toast.add({
      title: "Succès",
      description: "Profil mis à jour avec succès",
      color: "success",
    });
    
    emit("updated");
    isOpen.value = false;
  } catch (error: any) {
    if (error.statusCode === 401 || error.message?.includes("password") || error.message?.includes("auth")) {
      toast.add({
        title: "Erreur d'authentification",
        description: "Mot de passe incorrect ou session expirée",
        color: "error",
      });
    } else {
      toast.add({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        color: "error",
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>