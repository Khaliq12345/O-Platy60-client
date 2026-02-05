<template>
  <div class="space-y-2">
    <p>Modifier la transformation</p>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <!-- Quantités -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Quantité Reçue -->
        <UFormField name="quantity_received" label="Quantité Reçue" required>
          <UInputNumber
            v-model="state.quantity_received"
            :step="0.01"
            :min="0.01"
            class="w-full"
            :format-options="weightFormat(unit)"
          />
        </UFormField>

        <!-- Quantité Utilisable (calculée) -->
        <UFormField label="Quantité Utilisable">
          <UInputNumber
            :model-value="usableQuantity"
            disabled
            :step="0.01"
            class="w-full"
            :format-options="weightFormat(unit)"
          />
        </UFormField>

        <!-- Déchets -->
        <UFormField name="waste_quantity" label="Déchets" required>
          <UInputNumber
            v-model="state.waste_quantity"
            :step="0.01"
            :min="0"
            class="w-full"
            :format-options="weightFormat(unit)"
          />
        </UFormField>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          @click="$emit('cancel')"
        >
          Annuler
        </UButton>

        <UButton
          type="submit"
          color="primary"
          icon="i-heroicons-check"
          :loading="loading"
        >
          Enregistrer
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
  unit: string
}>();

const emit = defineEmits<{
  saved: [data: any];
  cancel: [];
}>();

const { put } = useApi();
const toast = useToast();
const loading = ref(false);

const schema = z.object({
  quantity_received: z.coerce.number().min(0.01, "Minimum 0.01"),
  waste_quantity: z.coerce.number().min(0, "Minimum 0"),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Schema>({
  quantity_received: props.transformation.quantity_received,
  waste_quantity: props.transformation.waste_quantity,  
});

const usableQuantity = computed(() => {
  return Math.max(0, state.quantity_received - state.waste_quantity);
});

const unitMapping: Record<string, string> = {
  kg: "kilogram",
  g: "gram",
  l: "liter",
  ml: "milliliter",
  m: "meter",
  cm: "centimeter",
  unit: "unit",
};

const weightFormat = (unit: string) => ({
  style: "unit",
  unit: unitMapping[unit] || "kilogram",
  unitDisplay: "short",
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;

  try {
    const payload = {
      quantity_received: event.data.quantity_received,
      quantity_usable: usableQuantity.value,
      waste_quantity: event.data.waste_quantity,
    };

    const response = await put(
      `/transformations/${props.transformation.id}`,
      payload,
    );

    toast.add({
      title: "Succès",
      description: "Transformation mise à jour",
      color: "success",
    });

    window.location.reload()
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: "Erreur lors de la modification",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
