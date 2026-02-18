<template>
  <UModal v-model:open="isOpen">
    <template #title>
      Nouvel Achat
    </template>

    <template #body>
      <!-- Loading -->
      <div v-if="loading" class="py-12 flex items-center justify-center">
        <Loading />
      </div>

      <!-- Error -->
      <div
        v-else-if="loadError"
        class="py-12 flex flex-col items-center justify-center px-4"
      >
        <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mb-4" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h2>
        <p class="text-gray-500 text-center mb-4 text-sm">
          Impossible de charger les données nécessaires.
        </p>
        <UButton
          color="primary"
          icon="i-lucide-refresh-cw"
          label="Réessayer"
          @click="loadData"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="inventories.length === 0"
        class="py-12 flex flex-col items-center justify-center px-4"
      >
        <UIcon name="i-lucide-circle-minus" class="w-12 h-12 text-gray-400 mb-4" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun produit disponible
        </h2>
        <p class="text-gray-500 text-center mb-4 text-sm">
          Vous devez d'abord créer un produit dans l'inventaire.
        </p>
        <UButton
          color="primary"
          icon="i-lucide-arrow-up-right"
          label="Créer un produit"
          to="/inventories"
        />
      </div>

      <!-- Form -->
      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Produit" name="inventory_id" required>
          <USelect
            v-model="state.inventory_id"
            :items="selectItems"
            placeholder="Sélectionner un produit"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Info produit sélectionné -->
        <div
          v-if="selectedInventory"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
        >
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-gray-500">Catégorie:</span>
              <span class="ml-1 font-medium">{{ selectedInventory.category_name }}</span>
            </div>
            <div>
              <span class="text-gray-500">Unité:</span>
              <span class="ml-1 font-medium">{{ selectedInventory.unit }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Quantité" name="quantity" required>
            <UInputNumber
              v-model="state.quantity"
              :min="1"
              placeholder="ex: 10"
              class="w-full"
              :disabled="isSubmitting"
            />
          </UFormField>

          <UFormField label="Prix par unité (FCFA)" name="price_per_unit" required>
            <UInputNumber
              v-model="state.price_per_unit"
              :step="0.01"
              :min="0"
              placeholder="ex: 2500"
              class="w-full"
              :disabled="isSubmitting"
            />
          </UFormField>
        </div>

        <!-- Prix total (calculé) -->
        <div class="p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Prix Total</div>
          <div class="text-xl font-bold text-primary-600 dark:text-primary-400">
            {{ totalPrice.toLocaleString("fr-FR") }} FCFA
          </div>
        </div>

        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            placeholder="Ajouter des détails supplémentaires..."
            :rows="3"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="soft"
          label="Annuler"
          :disabled="isSubmitting"
          @click="isOpen = false"
        />
        <UButton
          v-if="inventories.length > 0"
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || loading || loadError"
          :label="isSubmitting ? 'Enregistrement...' : 'Enregistrer'"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Inventory } from "~/types/inventory";
import type { Category } from "~/types/category";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { get, post } = useApi();
const toast = useToast();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const loading = ref(true);
const loadError = ref(false);
const isSubmitting = ref(false);

// Inject categories from parent
const injectedCategories = inject<Ref<Category[]>>("categories", ref([]));

const schema = z.object({
  inventory_id: z.string().min(1, "Veuillez sélectionner un produit"),
  quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
  price_per_unit: z.number().min(0.01, "Le prix doit être supérieur à 0"),
  notes: z.string().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  inventory_id: undefined,
  quantity: undefined,
  price_per_unit: undefined,
  notes: "",
});

const inventories = ref<
  Array<{
    inventory_id: string;
    name: string;
    unit: string;
    category: string;
    category_name: string;
  }>
>([]);

const selectItems = computed(() => {
  return inventories.value.map((inv) => ({
    label: inv.name,
    value: inv.inventory_id,
  }));
});

const selectedInventory = computed(() => {
  if (!state.inventory_id) return null;
  return inventories.value.find((inv) => inv.inventory_id === state.inventory_id);
});

const totalPrice = computed(() => {
  if (!state.quantity || !state.price_per_unit) return 0;
  return state.quantity * state.price_per_unit;
});

// Get category name from injected categories
function getCategoryName(categoryId: string): string {
  if (!categoryId) return "Non catégorisé";
  const category = injectedCategories.value.find((cat) => cat.id === categoryId);
  return category?.name || "Non catégorisé";
}

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

    // Enrich with category names from injected categories
    const enrichedInventories = inventoryList.map((inv) => ({
      inventory_id: inv.inventory_id,
      name: inv.name,
      unit: inv.unit,
      category: inv.category || "",
      category_name: getCategoryName(inv.category || ""),
    }));

    inventories.value = enrichedInventories;
  } catch (err) {
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

async function onSubmit() {
  const selected = selectedInventory.value;

  if (!selected) {
    toast.add({
      title: "Erreur",
      description: "Produit non trouvé.",
      color: "error",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const purchaseData = {
      item_name: selected.name,
      quantity: state.quantity!,
      unit: selected.unit,
      price_per_unit: state.price_per_unit!,
      total_price: totalPrice.value,
      purchase_date: new Date().toISOString().split("T")[0],
      category_id: selected.category,
      inventory_id: state.inventory_id!,
      notes: state.notes || "",
      created_by: authStore.user?.id,
    };

    await post("/purchases", purchaseData);

    toast.add({
      title: "Succès",
      description: "L'achat a été créé avec succès.",
      color: "success",
    });

    // Reset form
    state.inventory_id = undefined;
    state.quantity = undefined;
    state.price_per_unit = undefined;
    state.notes = "";

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
}

watch(() => props.open, (newOpen) => {
  if (newOpen) {
    loadData();
  }
});
</script>