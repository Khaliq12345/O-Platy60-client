<template>
  <UPageCard
    class="max-w-3xl mx-auto text-wrap m-5"
    variant="naked"
    :title="transformation.product_name"
    :description="`Transformation #${transformation.id}`"
  >
    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UFormField label="Nom de l'étape" name="step_name" required>
        <UInput
          v-model="state.step_name"
          placeholder="Ex: Poulet Grillé, Cuisses Sautées..."
          icon="i-heroicons-tag"
        />
      </UFormField>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UFormField label="Portions" name="portions" required>
          <UInputNumber
            v-model="state.portions"
            placeholder="Entrer le nombre de portions"
          >
          </UInputNumber>
        </UFormField>

        <UFormField
          label="Quantité utilisée"
          name="quantity"
          required
          :help="`Stock disponible: ${transformation.remaining_quantity} ${transformation.unit}`"
        >
          <UInputNumber
            v-model="state.quantity"
            placeholder="Entrer la quantité"
          >
          </UInputNumber>
        </UFormField>
      </div>

      <div class="flex gap-3 pt-4">
        <UButton type="submit" color="primary" icon="i-heroicons-check-circle">
          Ajouter l'étape
        </UButton>
      </div>
    </UForm>
  </UPageCard>
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
      .number()
      .min(1, "Minimum 1 portion")
      .int("Doit être un nombre entier"),

    quantity: z.coerce
      .number()
      .min(0.01, "Minimum 0.01")
      .positive("Doit être positif"),
  })
  .refine((data) => data.quantity <= props.transformation.remaining_quantity, {
    message: `Stock insuffisant (disponible: ${props.transformation.remaining_quantity} ${props.transformation.unit})`,
    path: ["quantity"],
  });

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  step_name: "",
  portions: undefined,
  quantity: undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
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
  }
};
</script>
