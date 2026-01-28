<script setup lang="ts">
import { z } from "zod";
import type { TransformationSummary } from "~/types/transformation";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  transformation: TransformationSummary;
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
    message: `Stock insuffisant (disponible: ${props.transformation.remaining_quantity} kg)`,
    path: ["quantity"],
  });

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  step_name: "",
  portions: undefined,
  quantity: undefined,
});

// Calcul du stock restant après opération
const remainingAfter = computed(() => {
  const qty = Number(state.quantity) || 0;
  return props.transformation.remaining_quantity - qty;
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

<template>
  <UCard class="max-w-3xl mx-auto">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ transformation.product_name }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Transformation #{{ transformation.id.slice(0, 8) }}
          </p>
        </div>
        <UBadge color="primary" variant="soft">
          Étape {{ (transformation.step_count || 0) + 1 }}
        </UBadge>
      </div>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UFormField label="Nom de l'étape" name="step_name" required>
        <UInput
          v-model="state.step_name"
          placeholder="Ex: Poulet Grillé, Cuisses Sautées..."
          icon="i-heroicons-tag"
        />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Portions" name="portions" required>
          <UInput
            v-model.number="state.portions"
            type="number"
            min="1"
            step="1"
            placeholder="0"
          >
            <template #trailing>
              <span class="text-gray-500 text-sm">parts</span>
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Quantité utilisée" name="quantity" required>
          <UInput
            v-model.number="state.quantity"
            type="number"
            min="0.01"
            :max="transformation.remaining_quantity"
            step="0.01"
            placeholder="0"
          >
            <template #trailing>
              <span class="text-gray-500 text-sm">kg</span>
            </template>
          </UInput>
          <template #hint>
            <span
              class="text-xs"
              :class="
                remainingAfter < 0
                  ? 'text-red-500 font-medium'
                  : 'text-gray-500'
              "
            >
              Stock disponible:
              {{ transformation.remaining_quantity.toFixed(2) }} kg
            </span>
          </template>
        </UFormField>
      </div>

      <!-- Récap avec alerte si négatif -->
      <div
        v-if="state.quantity"
        class="p-4 rounded-lg space-y-2"
        :class="
          remainingAfter < 0
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-gray-50 dark:bg-gray-800'
        "
      >
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400"
            >Quantité à retirer:</span
          >
          <span class="font-semibold text-gray-900 dark:text-white"
            >{{ state.quantity }} kg</span
          >
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400"
            >Stock après opération:</span
          >
          <span
            class="font-semibold"
            :class="remainingAfter < 0 ? 'text-red-600' : 'text-green-600'"
          >
            {{ remainingAfter.toFixed(2) }} kg
            <span v-if="remainingAfter < 0" class="text-xs ml-1"
              >(Impossible)</span
            >
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <UButton
          type="button"
          variant="soft"
          color="neutral"
          @click="router.back()"
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          color="primary"
          icon="i-heroicons-check-circle"
          :disabled="remainingAfter < 0"
        >
          Ajouter l'étape
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
