<template>
  <UCard class="max-w-4xl mx-auto">
    <template #header>
      <MetricsWithBadge
        title="Stock disponible"
        :value="remainingQuantity"
        badge-value="kg"
        color="green"
      />
    </template>

    <UForm
      :schema="refinedSchema"
      :state="state"
      class="space-y-6"
      @submit="onSubmit"
    >
      <!-- Infos de base -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Nom du produit" name="product_name" required>
          <UInput
            v-model="state.product_name"
            placeholder="Ex: Tomates concassées, Frites..."
            icon="i-heroicons-cube"
          />
        </UFormField>
      </div>

      <!-- Quantités -->
      <div class="space-y-4">
        <h3 class="font-semibold text-gray-900 dark:text-white border-b pb-2">
          Quantités
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Quantité Reçue avec Max sur la même ligne -->
          <UFormField name="quantity_received" label="Quantité Reçue" required>
            <UInputNumber
              v-model="state.quantity_received"
              :step="0.01"
              :min="0"
              :max="purchase?.remaining_quantity"
              placeholder="Mettre la Quantité Reçue"
              class="w-full"
              :format-options="weightFormat(purchase.unit)"
            >
            </UInputNumber>
          </UFormField>

          <!-- // Quantité a utiliser -->
          <UFormField
            label="Quantité Utilisable"
            name="quantity_usable"
            help="Calculé auto."
            required
          >
            <UInputNumber
              v-model="state.quantity_usable"
              :format-options="weightFormat(purchase.unit)"
            >
            </UInputNumber>
          </UFormField>

          <!-- // Dechets initial -->
          <!-- <UFormField label="Déchets">
            <UInputNumber
              :model-value="wasteQuantity"
              class="bg-gray-50"
              :format-options="weightFormat(purchase.unit)"
            >
            </UInputNumber>
          </UFormField> -->
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
              {{ state.quantity_received }} total
            </span>
          </div>
          <UProgress
            v-if="state.quantity_received > 0"
            :model-value="
              ((state.quantity_usable || 0) / state.quantity_received) * 100
            "
            color="success"
            size="sm"
          >
            <template #indicator>
              <div class="text-xs text-white font-medium px-2">
                {{
                  Math.round(
                    ((state.quantity_usable || 0) / state.quantity_received) *
                      100,
                  )
                }}%
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

      <!-- Actions - sans trait/bordure au dessus -->
      <div class="flex justify-end gap-3 pt-4">
        <UButton
          type="button"
          variant="soft"
          color="neutral"
          @click="router.back()"
        >
          Annuler
        </UButton>
        <UButton type="submit" color="primary" icon="i-heroicons-check-circle">
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

  quantity_received: z.coerce
    .number()
    .min(0.01, "Minimum 0.01")
    .max(100, `Max: 100`),

  quantity_usable: z.coerce.number().min(0, "Minimum 0"),
  transformation_date: z.string().min(1, "Date requise"),
  notes: z.string().optional(),
});

const refinedSchema = schema.superRefine((data, ctx) => {
  // Check 2: Received vs Purchase Inventory
  console.log("RECU ", data.quantity_received, props.purchase.quantity);
  if (data.quantity_received > remainingQuantity.value) {
    console.log("PARSING ", 1);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `La quantité reçue (${data.quantity_received}) dépasse le stock disponible (${props.purchase.quantity})`,
      path: ["quantity_received"],
    });
  }
});

// Calcule la quantite qui reste
const remainingQuantity = computed(() => {
  console.log("QUANTITY", props.purchase.quantity);
  if (!props.purchase?.transformations) return props.purchase.quantity;
  if (props.purchase.transformations[0]?.remaining_quantity == 0)
    return props.purchase.quantity;
  return props.purchase.transformations[0]?.remaining_quantity;
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  product_name: "", // Vide pour forcer la saisie
  quantity_received: undefined,
  quantity_usable: undefined,
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
      ...event.data,
      purchase_id: props.purchase?.id,
      waste_quantity: wasteQuantity.value,
      created_by: "42ad2622-23a6-4fce-91fd-4c1996bb2902", // to change
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
</script>
