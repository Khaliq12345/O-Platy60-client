<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const props = defineProps<{
  purchaseId?: string;
}>();

const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();

const { get, post } = useApi();
const toast = useToast();


const schema = z.object({
  purchase_id: z
    .string()
    .min(1, "Veuillez choisir un achat"),

  product_name: z
    .string()
    .min(2, "Le nom du produit est requis"),

  quantity_received: z
    .coerce
    .number({ invalid_type_error: "La quantité reçue est requise" })
    .min(0.1, "La quantité reçue doit être > 0"),

  quantity_usable: z
    .coerce
    .number({ invalid_type_error: "La quantité utilisable est requise" })
    .min(0.1, "La quantité utilisable doit être > 0"),

  waste_quantity: z
    .coerce
    .number({ invalid_type_error: "La quantité de déchets doit être un nombre" })
    .min(0, "La quantité de déchets ne peut pas être négative"),

  transformation_date: z
    .instanceof(CalendarDate, { message: "Date requise" }),

  notes: z
    .string()
    .optional(),

  created_by: z
    .string()
    .min(1, "Le créateur est requis"),
});


type Schema = z.output<typeof schema>;

// État
const loading = ref(false);
const datePickerOpen = ref(false);
const inputDate = useTemplateRef("inputDate");

const state = reactive<Partial<Schema>>({
  purchase_id: props.purchaseId || undefined,
  product_name: undefined,
  quantity_received: undefined,
  quantity_usable: undefined,
  waste_quantity: undefined,
  transformation_date: today(getLocalTimeZone()),
  notes: undefined,
  created_by: "current_user",
});

// Données
const availablePurchases = ref<any[]>([]);
const selectedPurchase = ref<any>();

// Calculs
const wastePercent = computed(() => {
  if (!state.quantity_received || state.waste_quantity === undefined) return 0;
  return state.quantity_received > 0
    ? Math.round((state.waste_quantity / state.quantity_received) * 100)
    : 0;
});

// Watch pour la sélection d'achat
watch(
  () => state.purchase_id,
  (purchaseId) => {
    const purchase = availablePurchases.value.find((p) => p.id === purchaseId);
    if (purchase) {
      selectedPurchase.value = purchase;
      state.product_name = purchase.item_name;
      state.quantity_received = purchase.quantity;
      state.quantity_usable = purchase.quantity;
      state.waste_quantity = 0;
    }
  },
);

// Watch pour la quantité utilisable
watch(
  () => state.quantity_usable,
  (newVal) => {
    if (state.quantity_received !== undefined && newVal !== undefined) {
      state.waste_quantity = Math.max(0, state.quantity_received - newVal);
    }
  },
);

async function loadPurchases() {
  loading.value = true;
  try {
    const purchases = await get<any[]>("/purchases");
    availablePurchases.value = purchases || [];
  } catch {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les achats",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const data = {
      ...event.data,
      transformation_date: event.data.transformation_date.toString(),
      waste_percent: wastePercent.value,
    };

    await post("/transformations", data);

    toast.add({
      title: "Succès",
      description: "Transformation créée avec succès",
      color: "success",
    });

    emit("submit", data);
  } catch {
    toast.add({
      title: "Erreur",
      description: "Impossible de créer la transformation",
      color: "error",
    });
  }
}

function onCancel() {
  emit("cancel");
}

onMounted(loadPurchases);
</script>

<template>
  <div class="md:max-w-3/4 mx-auto px-4 py-8">
    <UButton
      to="/purchases"
      variant="ghost"
      color="neutral"
      icon="i-heroicons-arrow-left"
      class="mb-4"
    >
      Retour
    </UButton>

    <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
      Nouvelle Transformation
    </h1>

    <UCard class="shadow-sm">
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-8"
        @submit="onSubmit"
      >
        <!-- Étape 1: Informations Initiales -->
        <div class="space-y-6">
          <!-- Sélection de l'Achat -->
          <UFormField label="Sélection de l'Achat" name="purchase_id" required>
            <USelect
              v-model="state.purchase_id"
              :items="
                availablePurchases.map((p) => ({
                  label: `${p.item_name} - ${p.quantity} ${p.unit} - Acheté le ${new Date(p.purchase_date).toLocaleDateString('fr-FR')}`,
                  value: p.id,
                }))
              "
              :loading="loading"
              placeholder="Choisir un achat"
              class="w-full"
            />
          </UFormField>

          <!-- Stock disponible -->
          <div
            v-if="selectedPurchase"
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <p class="text-blue-800 dark:text-blue-200">
              <span class="font-medium">Stock disponible:</span>
              {{ selectedPurchase.quantity }} {{ selectedPurchase.unit }}
            </p>
          </div>

          <!-- Informations de Base -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Nom du produit" name="product_name" required>
              <UInput
                v-model="state.product_name"
                placeholder="Nom du produit transformé"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Date de transformation"
              name="transformation_date"
              required
            >
              <UPopover v-model:open="datePickerOpen">
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-between"
                  :label="
                    state.transformation_date
                      ? new Date(state.transformation_date).toLocaleDateString(
                          'fr-FR',
                        )
                      : 'JJ/MM/AAAA'
                  "
                  trailing-icon="i-heroicons-calendar-days"
                />

                <template #content>
                  <UCalendar
                    v-model="state.transformation_date"
                    class="p-2"
                    @update:model-value="datePickerOpen = false"
                  />
                </template>
              </UPopover>
            </UFormField>
          </div>
        </div>

        <!-- Étape 2: Quantités Initiales -->

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UFormField label="Quantité Reçue" name="quantity_received" required>
            <UInput
              v-model="state.quantity_received"
              type="number"
              disabled
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 text-sm">{{
                  selectedPurchase?.unit || "kg"
                }}</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="Quantité Utilisable"
            name="quantity_usable"
            required
          >
            <UInput
              v-model="state.quantity_usable"
              type="number"
              step="0.1"
              min="0"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 text-sm">{{
                  selectedPurchase?.unit || "kg"
                }}</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Déchets Initiaux" name="waste_quantity">
            <div class="relative">
              <UInput
                :model-value="state.waste_quantity || 0"
                disabled
                class="w-full pr-16"
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              >
                {{ wastePercent }}%
              </span>
            </div>
          </UFormField>
        </div>

        <!-- Étape 3: Notes -->
        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            placeholder="Ajouter des détails supplémentaires..."
            :rows="4"
            class="w-full"
          />
        </UFormField>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-6">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            label="Annuler"
            @click="onCancel"
          />
          <UButton type="submit" color="primary" label="Créer la Section" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
