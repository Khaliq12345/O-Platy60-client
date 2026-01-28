<script setup lang="ts">
import { z } from "zod";
import type { PurchaseSummary } from "~/types/purchase";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  purchase: PurchaseSummary;
}>();

const { post } = useApi();
const toast = useToast();
const router = useRouter();

const schema = z.object({
  product_name: z.string().min(1, "Nom requis"),

  quantity_received: z.coerce
    .number()
    .min(0.01, "Minimum 0.01")
    .max(
      props.purchase?.remaining_quantity,
      `Max: ${props.purchase?.remaining_quantity}`,
    ),

  quantity_usable: z.coerce.number().min(0, "Minimum 0"),

  transformation_date: z.string().min(1, "Date requise"),

  notes: z.string().optional(),
});

const refinedSchema = schema.refine(
  (data) => data.quantity_usable <= data.quantity_received,
  {
    message: "Utilisable ne peut pas dépasser Reçu",
    path: ["quantity_usable"],
  },
);

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  product_name: "", // Vide pour forcer la saisie
  quantity_received: undefined,
  quantity_usable: undefined,
  transformation_date: new Date().toISOString().split("T")[0],
  notes: "",
});

const wasteQuantity = computed(() => {
  const received = Number(state.quantity_received) || 0;
  const usable = Number(state.quantity_usable) || 0;
  return Math.max(0, Number((received - usable).toFixed(2)));
});

watch(
  () => state.quantity_received,
  (newVal) => {
    if (state.quantity_usable && newVal && state.quantity_usable > newVal) {
      state.quantity_usable = newVal;
    }
  },
);

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

<template>
  <UCard class="max-w-4xl mx-auto ">
    <template #header>
      <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
        <span>Stock disponible:</span>
        <UBadge color="success" size="sm">
          {{ purchase?.remaining_quantity }} {{ purchase?.unit }}
        </UBadge>
      </div>
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

        <UFormField
          label="Date de transformation"
          name="transformation_date"
          required
        >
          <UInput
            v-model="state.transformation_date"
            type="date"
            class="w-full"
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
            <UInput
              v-model.number="state.quantity_received"
              type="number"
              step="0.01"
              min="0"
              :max="purchase?.remaining_quantity"
              placeholder="0"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 text-sm">{{ purchase?.unit }}</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="Quantité Utilisable"
            name="quantity_usable"
            required
          >
            <UInput
              v-model.number="state.quantity_usable"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
            >
              <template #trailing>
                <span class="text-gray-500 text-sm">{{ purchase?.unit }}</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Déchets">
            <UInput :model-value="wasteQuantity" disabled class="bg-gray-50">
              <template #trailing>
                <span class="text-gray-500 text-sm">{{ purchase?.unit }}</span>
              </template>
            </UInput>
            <template #hint>
              <span class="text-xs text-gray-500">Calculé auto.</span>
            </template>
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
          <div class="flex justify-between text-xs mt-1 text-gray-500">
            <span class="text-green-600"
              >{{ state.quantity_usable || 0 }} utilisable</span
            >
            <span class="text-orange-600">{{ wasteQuantity }} déchet</span>
          </div>
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
