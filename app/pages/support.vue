<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Support" />
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto">
        <UPageCard variant="outline" class="md:p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Envoyer une demande de support
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              Décrivez votre problème et nous vous répondrons dans les plus
              brefs délais.
            </p>
          </div>

          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField label="Titre" name="title" required>
              <UInput
                v-model="state.title"
                placeholder="Résumé du problème"
                icon="i-heroicons-document-text"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Description" name="content" required>
              <UTextarea
                v-model="state.content"
                placeholder="Décrivez votre problème en détail..."
                :rows="6"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                label="Annuler"
                @click="navigateTo('/dashboard')"
              />
              <UButton
                type="submit"
                color="primary"
                :loading="loading"
                icon="i-heroicons-paper-airplane"
                label="Envoyer"
              />
            </div>
          </UForm>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const auth = useAuthStore();
const loading = ref(false);

const toast = useToast();

const schema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100),
  content: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(2000),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  title: "",
  content: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    const response = await $fetch("/api/contact", {
      method: "POST",
      body: {
        title: event.data.title,
        description: event.data.content,
        userMail: auth.user?.email || "noreply@oplaty60.com",
      },
    });
    if (response.success) {
      toast.add({
        title: "Success",
        description: "Votre message a été envoyé.",
        color: "success",
      });
      navigateTo("/");
    } else {
      toast.add({
        title: "Error",
        description: response.error,
        color: "error",
      });
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Impossible d'envoyer le message. Veuillez réessayer.",
      color: "error",
    });
    console.error("Contact form error:", error);
  }
  loading.value = false;
}
</script>
