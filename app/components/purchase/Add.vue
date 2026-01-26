<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { CreatePurchaseInput } from "~/types/purchase";
import { Category } from "~/types/category";

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [data: CreatePurchaseInput];
}>();

// État du drawer
const isOpen = ref(false);

// Schéma Zod de validation
const schema = z.object({
  item_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
  unit: z.string().min(1, "L'unité est requise"),
  price_per_unit: z.number().min(0.01, "Le prix doit être supériXOF à 0"),
  purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)"),
  category_id: z.string().min(1, "La catégorie est requise"),
  notes: z.string().optional(),
});

type Schema = z.output<typeof schema>;

// État du formulaire
const state = reactive<Partial<Schema>>({
  item_name: "",
  quantity: 1,
  unit: "pièce",
  price_per_unit: 0,
  purchase_date: new Date().toISOString().split("T")[0],
  category_id: "",
  notes: "",
});

// Calcul du prix total (affichage uniquement)
const totalPrice = computed(() => {
  if (!state.quantity || !state.price_per_unit) return 0;
  return state.quantity * state.price_per_unit;
});

// Catégories dynamiques
const categories = ref<{ label: string; value: string }[]>([])

// Unités prédéfinies
const units = [
  { label: "Pièce", value: "pièce" },
  { label: "Kilogramme", value: "kg" },
  { label: "Litre", value: "L" },
  { label: "Mètre", value: "m" },
  { label: "Ramette", value: "ramette" },
  { label: "Forfait", value: "forfait" },
];

const toast = useToast();

// Soumission du formulaire
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const { post } = useApi();

    const purchaseData = {
      ...event.data,
      total_price: totalPrice.value,
      created_by: "current_user", // À remplacer par l'utilisateur connecté
    };

    await post("/purchases", purchaseData);

    toast.add({
      title: "Succès",
      description: "L'achat a été créé avec succès.",
      color: "success",
    });

    emit("submit", purchaseData);
    isOpen.value = false;

    // Reset du formulaire
    Object.assign(state, {
      item_name: "",
      quantity: 1,
      unit: "pièce",
      price_per_unit: 0,
      purchase_date: new Date().toISOString().split("T")[0],
      category_id: "",
      notes: "",
    });
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
  }
}

// Fermer sans sauvegarder
function onCancel() {
  isOpen.value = false;
}

onMounted(async () => {
  const { get } = useApi()
  const response = await get<Category[]>('/categories')
  categories.value = response.map(cat => ({
    label: cat.name,
    value: cat.id
  }))
})

</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    direction="right"
    Description="Fill data to complete purchase"
    DialogTitle="New purchase"
    aria-describedby="Purchase form"
    :inset="false"
    :handle="false"
    :dismissible="true"
    :ui="{
      content: 'w-full max-w-md rounded-none',
    }"
  >
    <UButton
      label="Nouvelle commande"
      color="primary"
      variant="subtle"
      @click="isOpen = true"
    />

    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Nouvel achat
        </h2>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Remplissez les informations ci-dessous
      </p>
    </template>

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="grid grid-cols-1 gap-2"
        @submit="onSubmit"
      >
        <!-- Nom de l'article -->
        <UFormField label="Nom de l'article" name="item_name" required>
          <UInput
            v-model="state.item_name"
            placeholder="Ex: OrdinatXOF portable"
            icon="i-heroicons-shopping-bag"
            class="w-full"
          />
        </UFormField>

        <!-- Quantité et Unité (côte à côte) -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Quantité" name="quantity" required>
            <UInput
              v-model="state.quantity"
              type="number"
              min="1"
              placeholder="1"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Unité" name="unit" required>
            <USelect
              v-model="state.unit"
              :items="units"
              placeholder="Choisir..."
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Prix par unité -->
          <UFormField label="Prix par unité" name="price_per_unit" required>
            <UInput
              v-model="state.price_per_unit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500">F</span>
              </template>
            </UInput>
          </UFormField>

          <!-- Prix total (calculé, non modifiable) -->
          <UFormField label="Prix total (calculé)">
            <UInput
              :model-value="
                totalPrice.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                })
              "
              disabled
              color="neutral"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Date d'achat -->
        <UFormField label="Date d'achat" name="purchase_date" required>
          <UInput v-model="state.purchase_date" type="date" class="w-full" />
        </UFormField>

        <!-- Catégorie -->
        <UFormField label="Catégorie" name="category_id" required>
          <USelect
            v-model="state.category_id"
            :items="categories"
            placeholder="Choisir une catégorie..."
            icon="i-heroicons-tag"
            class="w-full"
          />
        </UFormField>

        <!-- Notes -->
        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            placeholder="Notes additionnelles (optionnel)..."
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </UForm>
      <!-- Boutons d'action (dans le body car footer est fixe) -->
      <div class="grid grid-cols-2 gap-2">
        <UButton
          type="submit"
          color="primary"
          label="Créer l'achat"
        />
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          label="Annuler"
          @click="onCancel"
        />
      </div>
    </template>
    <template #footer> </template>
  </UDrawer>
</template>
