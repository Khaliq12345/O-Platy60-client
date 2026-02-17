<template>
  <UModal
    v-model:open="isOpen"
    title="Nouveau membre"
    description="Créer un nouveau compte utilisateur"
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
            placeholder="Jean Dupont"
            icon="i-heroicons-user"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Email" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="jean.dupont@exemple.com"
            icon="i-heroicons-envelope"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Rôle" name="role" required>
          <USelect
            v-model="state.role"
            :items="roleItems"
            placeholder="Sélectionnez un rôle"
            icon="i-heroicons-shield-check"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Mot de passe" name="password" required>
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="link"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
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
            label="Créer"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { Role } from '~/types/enums'

const emit = defineEmits<{
  created: [];
}>();

const { post } = useApi();
const toast = useToast();

const isOpen = defineModel("open", { default: false });
const loading = ref(false);
const showPassword = ref(false);

// Items pour le select de rôle (format attendu par USelect)
const roleItems = [
  { label: 'Admin', value: Role.ADMIN },
  { label: 'Manager', value: Role.MANAGER }
]

const schema = z.object({
  full_name: z.string().min(2, "Nom trop court"),
  email: z.email("Email invalide"),
  role: z.enum([Role.ADMIN, Role.MANAGER], {
    required_error: 'Veuillez sélectionner un rôle',
    invalid_type_error: 'Rôle invalide'
  }),
  password: z.string().min(8, "Minimum 8 caractères"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  full_name: "",
  email: "",
  role: undefined as string | undefined,
  password: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await post("/auth/signup", {
      full_name: event.data.full_name,
      email: event.data.email,
      role: event.data.role,
      password: event.data.password,
    });

    toast.add({
      title: "Succès",
      description: "Le membre a été créé avec succès",
      color: "success",
    });

    emit("created");
    isOpen.value = false;
    
    // Reset form
    state.full_name = "";
    state.email = "";
    state.role =undefined as string | undefined;
    state.password = "";
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de créer le membre",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>