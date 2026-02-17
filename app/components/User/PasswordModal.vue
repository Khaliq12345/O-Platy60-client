<template>
  <UModal
    v-model:open="isOpen"
    title="Changer le mot de passe"
    description="Entrez votre mot de passe actuel et le nouveau"
  >
    <template #content>
      <UAuthForm
        :fields="fields"
        :schema="schema"
        :loading="loading"
        :submit="{ label: 'Changer le mot de passe' }"
        class="p-4"
        @submit="onSubmit"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const { post } = useApi();
const auth = useAuthStore();
const toast = useToast();

const isOpen = defineModel("open", { default: false });
const loading = ref(false);

const fields: AuthFormField[] = [
  {
    name: "current_password",
    type: "password",
    label: "Mot de passe actuel",
    placeholder: "••••••••",
    required: true,
  },
  {
    name: "new_password",
    type: "password",
    label: "Nouveau mot de passe",
    placeholder: "••••••••",
    required: true,
  },
  {
    name: "confirm_password",
    type: "password",
    label: "Confirmer le mot de passe",
    placeholder: "••••••••",
    required: true,
  },
];

const schema = z.object({
  current_password: z.string("Champ requis"),
  new_password: z.string("Champ requis").min(8, "Minimum 8 caractères"),
  confirm_password: z.string("Champ requis"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!auth.user?.id || !auth.user?.email) return;
  
  loading.value = true;
  try {
    await post("/auth/change-password", {
      old_password: event.data.current_password,
      password: event.data.new_password,
      email: auth.user.email,
    });
    
    toast.add({
      title: "Succès",
      description: "Mot de passe changé avec succès",
      color: "success",
    });
    
    auth.clear();
    navigateTo("/login");
    isOpen.value = false;
  } catch (error: any) {
    if (error.statusCode === 401 || error.message?.includes("password") || error.message?.includes("auth")) {
      toast.add({
        title: "Erreur d'authentification",
        description: "Mot de passe actuel incorrect",
        color: "error",
      });
    } else {
      toast.add({
        title: "Erreur",
        description: "Impossible de changer le mot de passe",
        color: "error",
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>