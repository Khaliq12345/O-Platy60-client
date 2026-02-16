<template>
  <UModal
    v-model:open="isOpen"
    title="Changer le mot de passe"
    description="Entrez votre mot de passe actuel et le nouveau"
  >
    <template #content>
      <UForm
        :schema="schema"
        :state="state"
        class="p-4 space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Mot de passe actuel" name="current_password" required>
          <UInput
            v-model="state.current_password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Nouveau mot de passe" name="new_password" required>
          <UInput
            v-model="state.new_password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-key"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Confirmer le mot de passe" name="confirm_password" required>
          <UInput
            v-model="state.confirm_password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-check-circle"
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
            label="Changer"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{
  updated: [];
}>();

const { put } = useApi();
const auth = useAuthStore();
const toast = useToast();

const isOpen = defineModel("open", { default: false });
const loading = ref(false);

const schema = z.object({
  current_password: z.string().min(1, "Champ requis"),
  new_password: z.string().min(8, "Minimum 8 caractères"),
  confirm_password: z.string().min(1, "Champ requis"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!auth.user?.id || !auth.user?.email) return;
  
  loading.value = true;
  try {
    await put(`/users/${auth.user.id}`, {
      password: event.data.current_password,
      new_password: event.data.new_password,
      current_email: auth.user.email,
    });
    
    toast.add({
      title: "Succès",
      description: "Mot de passe changé avec succès",
      color: "success",
    });
    
    emit("updated");
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