<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <!-- Quantités -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Quantité Reçue -->
      <UFormField name="quantity_received" label="Quantité Reçue" required>
        <UInputNumber
          v-model="state.quantity_received"
          :step="0.01"
          :min="0.01"
          :max="maxQuantity"
          :disabled="isSubmitting"
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
          :disabled="isSubmitting"
          class="w-full"
          :format-options="weightFormat(unit)"
        />
      </UFormField>
    </div>

    <!-- Notes (optionnel) -->
    <UFormField v-if="showNotes" name="notes" label="Notes">
      <UTextarea
        v-model="state.notes"
        :disabled="isSubmitting"
        placeholder="Notes sur la transformation..."
        :rows="2"
      />
    </UFormField>

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        Annuler
      </UButton>
      
      <UButton
        type="submit"
        :color="submitColor"
        :icon="submitIcon"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  initialData?: {
    quantity_received: number;
    waste_quantity: number;
    notes?: string;
  };
  unit: string;
  maxQuantity: number;
  submitLabel?: string;
  submitColor?: string;
  submitIcon?: string;
  showNotes?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: {
    quantity_received: number;
    quantity_usable: number;
    waste_quantity: number;
    notes?: string;
  }];
  cancel: [];
}>();

// État de soumission exposé via v-model ou expose
const isSubmitting = ref(false);

const schema = z.object({
  quantity_received: z.coerce
    .number()
    .min(0.01, "Minimum 0.01")
    .max(props.maxQuantity, `Maximum ${props.maxQuantity}`),
  waste_quantity: z.coerce.number().min(0, "Minimum 0"),
  notes: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Schema>({
  quantity_received: props.initialData?.quantity_received ?? 0,
  waste_quantity: props.initialData?.waste_quantity ?? 0,
  notes: props.initialData?.notes ?? "",
});

const usableQuantity = computed(() => {
  return Math.max(0, state.quantity_received - state.waste_quantity);
});

const weightFormat = (unit: string) => {
  const unitMapping: Record<string, string> = {
    kg: "kilogram",
    g: "gram",
    l: "liter",
    ml: "milliliter",
    m: "meter",
    cm: "centimeter",
    unit: "unit",
  };
  
  return {
    style: "unit",
    unit: unitMapping[unit] || "kilogram",
    unitDisplay: "short",
  };
};

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (isSubmitting.value) return; // Double protection
  
  isSubmitting.value = true;
  
  try {
    await emit('submit', {
      quantity_received: event.data.quantity_received,
      quantity_usable: usableQuantity.value,
      waste_quantity: event.data.waste_quantity,
      notes: event.data.notes,
    });
  } finally {
    // Le parent doit nous dire quand c'est fini via une prop ou on garde le verrou
    // Option A: Le parent gère et on reset via watch
    // Option B: On garde verrouillé jusqu'à ce que le parent reset
  }
};

// Exposer pour que le parent puisse reset le loading
const resetSubmitting = () => {
  isSubmitting.value = false;
};

defineExpose({
  isSubmitting,
  resetSubmitting,
});
</script>