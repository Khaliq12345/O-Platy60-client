<template>
  <UCard class="max-w-4xl mx-auto">
    <template #header>
      <MetricsWithBadge
        title="Stock disponible"
        :value="purchase?.quantity.toString() || '0'"
        :badge-value="purchase?.unit || 'kg'"
        color="green"
      />
    </template>

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <!-- Quantités -->
      <div class="space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white border-b pb-2">
          Quantités
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Quantité Reçue -->
          <UFormField name="quantity_received" label="Quantité Reçue" required>
            <UInputNumber
              v-model="state.quantity_received"
              :step="0.01"
              :min="0.01"
              :max="purchase?.quantity"
              placeholder="0.00"
              class="w-full"
              :format-options="weightFormat(purchase.unit)"
            />
          </UFormField>

          <!-- Quantité Utilisable (calculée et désactivée) -->
          <UFormField
            label="Quantité Utilisable"
            name="quantity_usable"
            required
          >
            <UInputNumber
              :model-value="usableQuantity"
              disabled
              :step="0.01"
              class="w-full"
              :format-options="weightFormat(purchase.unit)"
            />
          </UFormField>

          <!-- Déchets (saisissable) -->
          <UFormField label="Déchets" name="waste_quantity" required>
            <UInputNumber
              v-model="state.waste_quantity"
              :step="0.01"
              :min="0"
              :max="state.quantity_received"
              placeholder="0.00"
              class="w-full"
              :format-options="weightFormat(purchase.unit)"
            />
          </UFormField>
        </div>
      </div>

      <!-- Notes -->
      <UFormField label="Notes" name="notes">
        <UTextarea
          v-model="state.notes"
          :rows="3"
          placeholder="Commentaires sur la transformation..."
          class="w-full"
        />
      </UFormField>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4">
        <UButton
          type="button"
          variant="soft"
          color="neutral"
          @click="router.back()"
          :loading="loading"
          :disabled="loading"
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          color="primary"
          icon="i-heroicons-check-circle"
          :loading="loading"
          :disabled="loading"
        >
          Créer
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { PurchaseItem } from "~/types/purchase";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  purchase: PurchaseItem;
}>();

const { post } = useApi();
const toast = useToast();
const router = useRouter();
const loading = ref(false);

const schema = z.object({
  quantity_received: z.coerce.number().min(0.01, "Minimum 0.01").default(0),

  waste_quantity: z.coerce.number().min(0, "Minimum 0").default(0),

  quantity_usable: z.number().min(0).default(0),

  transformation_date: z.string().min(1, "Date requise"),
  notes: z.string().optional(),
});

// Quantité utilisable calculée (Reçu - Déchets)
const usableQuantity = computed(() => {
  const received = state.quantity_received || 0;
  const waste = state.waste_quantity || 0;
  return Math.max(0, received - waste);
});

type Schema = z.infer<typeof schema>;

// État initial
const state = reactive<Partial<Schema>>({
  quantity_received: props.purchase.quantity,
  waste_quantity: 0, // Initialisé à 0
  quantity_usable: 0, // Sera calculé
  transformation_date: new Date().toISOString(),
  notes: "",
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

const weightFormat = (unit: string) => {
  const officialUnit = unitMapping[unit] || "kilogram";
  return {
    style: "unit",
    unit: officialUnit,
    unitDisplay: "short",
  };
};

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  try {
    const payload = {
      product_name: props.purchase.item_name,
      quantity_received: event.data.quantity_received,
      quantity_usable: usableQuantity.value,
      waste_quantity: event.data.waste_quantity || 0,
      transformation_date: new Date().toISOString().split("T")[0],
      notes: event.data.notes,
      purchase_id: props.purchase?.id,
      created_by: "42ad2622-23a6-4fce-91fd-4c1996bb2902",
      unit: props.purchase?.unit,
    };

    await post("/transformations", payload);

    toast.add({
      title: "Succès",
      description: "Transformation créée",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    router.push(`/purchases/${props.purchase?.id}`);
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
