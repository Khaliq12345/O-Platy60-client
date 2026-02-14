<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="h-screen flex items-center justify-center">
      <Loading />
    </div>

    <!-- Error -->
    <div
      v-else-if="loadError"
      class="h-screen flex flex-col items-center justify-center px-4"
    >
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Erreur de chargement
      </h2>
      <p class="text-gray-500 text-center mb-6">
        Impossible de charger les données nécessaires. Veuillez réessayer.
      </p>
      <UButton
        color="primary"
        icon="i-lucide-refresh-cw"
        label="Réessayer"
        @click="reloadData"
      />
    </div>

    <!-- Form -->
    <div v-else-if="inventories.length > 0" class="max-w-2xl mx-auto px-4 py-8">
      <!-- Lien retour -->
      <UButton
        color="neutral"
        variant="link"
        icon="i-heroicons-arrow-left"
        label="Retour"
        class="mb-4 px-0"
        @click="onCancel"
      />

      <!-- Titre -->
      <h1
        class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4"
      >
        Nouvel Achat
      </h1>

      <!-- Formulaire avec loading -->
      <UForm
        :schema="schema"
        :state="state"
        :loading="isSubmitting"
        class="space-y-6"
        @submit="onSubmit"
      >
        <!-- Sélection de l'inventaire -->
        <UFormField label="Produit" name="inventory_id" required>
          <USelect
            v-model="state.inventory_id"
            :items="selectItems"
            placeholder="Sélectionner un produit"
            class="w-full"
            :disabled="isSubmitting"
            @update:model-value="onInventorySelect"
          />
        </UFormField>

        <!-- Info produit sélectionné -->
        <div
          v-if="selectedInventory"
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Catégorie:</span>
              <span class="ml-2 font-medium">{{
                selectedInventory.category_name
              }}</span>
            </div>
            <div>
              <span class="text-gray-500">Unité:</span>
              <span class="ml-2 font-medium">{{ selectedInventory.unit }}</span>
            </div>
          </div>
        </div>

        <!-- Quantité -->
        <UFormField label="Quantité" name="quantity" required>
          <UInputNumber
            v-model="state.quantity"
            :min="1"
            placeholder="ex: 10"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Prix par unité -->
        <UFormField
          label="Prix par unité (FCFA)"
          name="price_per_unit"
          required
        >
          <UInputNumber
            v-model="state.price_per_unit"
            :step="0.01"
            :min="0"
            placeholder="ex: 2500"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Prix total (calculé) -->
        <UFormField label="Prix Total" required>
          <div
            class="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400"
          >
            {{ totalPrice.toLocaleString("fr-FR") }} FCFA
          </div>
        </UFormField>

        <!-- Notes -->
        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            placeholder="Ajouter des détails supplémentaires..."
            :rows="4"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Boutons -->
        <div class="flex justify-end gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            label="Annuler"
            :disabled="isSubmitting"
            @click="onCancel"
          />
          <UButton
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            :label="isSubmitting ? 'Enregistrement...' : 'Enregistrer'"
          />
        </div>
      </UForm>
    </div>

    <!-- Empty -->
    <div v-else>
      <UEmpty icon="i-lucide-circle-minus" title="Aucun produit disponible.">
        <template #action>
          <UButton
            icon="i-lucide-arrow-up-right"
            variant="subtle"
            :to="`/inventories`"
          >
            Créer un produit
          </UButton>
        </template>
      </UEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Inventory } from "~/types/inventory";
import type { Category } from "~/types/category";

const router = useRouter();
const { get, post } = useApi();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const loadError = ref(false);
const isSubmitting = ref(false); // ← État de soumission

// Schéma Zod de validation
const schema = z.object({
  inventory_id: z.string().min(1, "Veuillez sélectionner un produit"),
  quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
  price_per_unit: z.number().min(0.01, "Le prix doit être supérieur à 0"),
  notes: z.string().optional(),
});

type Schema = z.output<typeof schema>;

// État du formulaire
const state = reactive<Partial<Schema>>({
  inventory_id: undefined,
  quantity: undefined,
  price_per_unit: undefined,
  notes: "",
});

// Cache des noms de catégories
const categoryNames = ref<Record<string, string>>({});

// Inventaires enrichis avec nom de catégorie
const inventories = ref<
  Array<{
    inventory_id: string;
    name: string;
    unit: string;
    category: string;
    category_name: string;
  }>
>([]);

// Inventaires pour le select
const selectItems = computed(function () {
  return inventories.value.map(function (inv) {
    return {
      label: inv.name,
      value: inv.inventory_id,
    };
  });
});

// Inventaire sélectionné
const selectedInventory = computed(function () {
  if (!state.inventory_id) return null;
  return inventories.value.find(function (inv) {
    return inv.inventory_id === state.inventory_id;
  });
});

// Calcul du prix total
const totalPrice = computed(function () {
  if (!state.quantity || !state.price_per_unit) return 0;
  return state.quantity * state.price_per_unit;
});

// Charger le nom d'une catégorie
async function loadCategoryName(categoryId: string): Promise<string> {
  if (categoryNames.value[categoryId]) {
    return categoryNames.value[categoryId];
  }

  try {
    const category = await get<Category>("/categories/" + categoryId);
    const name = category.name || "Non catégorisé";
    categoryNames.value[categoryId] = name;
    return name;
  } catch (err) {
    return "Non catégorisé";
  }
}

// Charger les données
async function loadData() {
  loading.value = true;
  loadError.value = false;

  try {
    const response = await get<{ inventories: Inventory[]; count: number }>(
      "/inventories",
    );
    const inventoryList = response?.inventories ?? [];

    if (inventoryList.length === 0) {
      inventories.value = [];
      loading.value = false;
      return;
    }

    // Charger les noms de catégories en parallèle
    const enrichedInventories = await Promise.all(
      inventoryList.map(async function (inv) {
        const categoryName = await loadCategoryName(inv.category || "");
        return {
          inventory_id: inv.inventory_id,
          name: inv.name,
          unit: inv.unit,
          category: inv.category || "",
          category_name: categoryName,
        };
      }),
    );

    inventories.value = enrichedInventories;
  } catch (err) {
    console.error("Erreur lors du chargement:", err);
    loadError.value = true;
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les produits.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function reloadData() {
  loadData();
}

// Soumission du formulaire avec loading
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const selected = selectedInventory.value;

  if (!selected) {
    toast.add({
      title: "Erreur",
      description: "Produit non trouvé.",
      color: "error",
    });
    return;
  }

  isSubmitting.value = true; // ← Active le loading

  try {
    const purchaseData = {
      item_name: selected.name,
      quantity: event.data.quantity,
      unit: selected.unit,
      price_per_unit: event.data.price_per_unit,
      total_price: totalPrice.value,
      purchase_date: new Date().toISOString().split("T")[0],
      category_id: selected.category,
      inventory_id: event.data.inventory_id,
      notes: event.data.notes || "",
      created_by: authStore.user?.id,
    };

    await post("/purchases", purchaseData);

    toast.add({
      title: "Succès",
      description: "L'achat a été créé avec succès.",
      color: "success",
    });

    router.push("/purchases");
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
  } finally {
    isSubmitting.value = false; // ← Désactive le loading
  }
}

// Annuler et retour
function onCancel() {
  router.push("/purchases");
}

// Quand on sélectionne un inventaire
function onInventorySelect(inventoryId: string) {
  console.log("Produit sélectionné:", inventoryId);
}

onMounted(function () {
  loadData();
});
</script>