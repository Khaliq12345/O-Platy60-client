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

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-6"
      @submit="onSubmit"
    >
      <!-- Infos de base -->
      <UFormField label="Nom du produit" name="product_name" required>
        <UInput
          v-model="state.product_name"
          placeholder="Ex: Tomates concassées, Frites..."
          icon="i-heroicons-cube"
        />
      </UFormField>

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

        <!-- Barre visuelle -->
        <div
          v-if="state.quantity_received"
          class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
        >
          <div
            class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex justify-between"
          >
            <span>Répartition:</span>
            <span class="font-medium text-gray-900 dark:text-white">
            {{ usableQuantity || 0 }} / {{ state.quantity_received }} récu
            </span>
          </div>
          <UProgress
            v-if="state.quantity_received > 0"
            :model-value="
              ((usableQuantity || 0) / state.quantity_received) * 100
            "
            color="success"
            size="sm"
          >
            <template #indicator>
              <div class="text-xs text-white font-medium px-2">
                {{ Math.round(((usableQuantity || 0) / state.quantity_received) * 100) }}%
              </div>
            </template>
          </UProgress>
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
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          color="primary"
          icon="i-heroicons-check-circle"
          :disabled="!isValid || usableQuantity <= 0"
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

const schema = z.object({
  product_name: z.string().min(1, "Nom requis"),
  
  quantity_received: z.coerce.number()
    .min(0.01, "Minimum 0.01")
    .default(0),
  
  waste_quantity: z.coerce.number()
    .min(0, "Minimum 0")
    .default(0),
  
  quantity_usable: z.number()
    .min(0)
    .default(0),
  
  transformation_date: z.string().min(1, "Date requise"),
  notes: z.string().optional(),
})

// Quantité utilisable calculée (Reçu - Déchets)
const usableQuantity = computed(() => {
  const received = state.quantity_received || 0;
  const waste = state.waste_quantity || 0;
  return Math.max(0, received - waste);
});

// Pourcentage utilisable pour la barre de progression
const usablePercentage = computed(() => {
  if (!state.quantity_received || state.quantity_received === 0) return 0;
  return (usableQuantity.value / state.quantity_received) * 100;
});

// Validation globale
const isValid = computed(() => {
  const result = schema.safeParse(state);
  return result.success && usableQuantity.value > 0 && state.waste_quantity > 0;
});

type Schema = z.infer<typeof schema>;

// État initial
const state = reactive<Partial<Schema>>({
  product_name: "",
  quantity_received: undefined,
  waste_quantity: 0, // Initialisé à 0
  quantity_usable: undefined, // Sera calculé
  transformation_date: new Date().toISOString().split("T")[0],
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
  try {
    const payload = {
      product_name: event.data.product_name,
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
  }
};
// Simplification du schema, la quantité ne dépasse pas la quantité de l'achat utilisé partout
// La quantité des déchets ne peut pas dépasser la quantité utilisable après
// La quantité utilisable est calculée automatiquement par quantité reçue - quantité déchets
// Utilisation de max dans les InputNumber pour éviter les valeurs débordantes
// Date de transformation prise localement avec new Date()
</script>
