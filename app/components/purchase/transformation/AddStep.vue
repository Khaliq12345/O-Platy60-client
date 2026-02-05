<template>
  <div class="mx-auto text-wrap my-2 px-2" variant="naked">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Nom" name="step_name" required>
        <UInput
          v-model="state.step_name"
          placeholder="Ex: Poulet Grillé, Cuisses Sautées..."
          icon="i-heroicons-tag"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <UFormField label="Portions" name="portions" required>
          <UInputNumber
            v-model="state.portions"
            placeholder="Nombre de portions"
            class="w-full"
            :step="0.1"
          >
          </UInputNumber>
        </UFormField>

        <UFormField label="Quantité utilisée" name="quantity" required>
          <UInputNumber
            v-model="state.quantity"
            placeholder="Entrer la quantité"
            class="w-full"
            :step="0.1"
          >
          </UInputNumber>
        </UFormField>
      </div>

      <div class="w-full flex items-center justify-center">
        <UButton
        type="submit"
        color="primary"
        size="sm"
        icon="i-heroicons-check-circle"
        :loading="loading"
        :disable="loading"
        :class="loading ? 'animate-pulse' : ''"
        >
        {{ loading ? "Ajout..." : "Ajouter" }}
      </UButton>
    </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Transformation } from "~/types/transformation";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  transformation: Transformation;
}>();

const { post } = useApi();
const toast = useToast();
const router = useRouter();

// Schéma avec validation du stock max
const schema = z
  .object({
    step_name: z.string().min(1, "Nom de l'étape requis"),

    portions: z.coerce
      .number("Ne peut pas être vide")
      .min(1, "Minimum 1 portion")
      .int("Doit être un nombre entier"),

    quantity: z.coerce
      .number("Ne peut pas être vide")
      .min(0.01, "Minimum 0.01")
      .positive("Doit être positif"),
  })
  .superRefine((data, ctx) => {
    if (data.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La quantité doit être supérieure à 0",
        path: ["quantity"],
      });
    }

    if (data.quantity > props.transformation.remaining_quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Stock insuffisant (${props.transformation.remaining_quantity} restants)`,
        path: ["quantity"],
      });
    }
  });

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  step_name: "",
  portions: undefined,
  quantity: undefined,
});

const loading = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  try {
    const payload = {
      ...event.data,
      transformation_id: props.transformation.id,
    };

    await post("/transformation-steps/", payload);

    toast.add({
      title: "Succès",
      description: "Étape ajoutée avec succès",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    router.push(`/transformations/${props.transformation.id}`);
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description:
        error?.response?._data?.message || "Erreur lors de la création",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    loading.value = false;
  }
};
</script>
