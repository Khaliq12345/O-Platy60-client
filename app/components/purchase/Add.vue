<template>
  <ModalForm
    v-model:open="isOpen"
    title="Nouvel Achat"
    :fields="fields"
    :schema="schema"
    :loading="loading"
    :load-error="loadError"
    :is-empty="inventories.length === 0"
    submit-label="Enregistrer"
    @submit="onSubmit"
    @reload="loadData"
  >
    <!-- Slot pour l'état vide -->
    <template #empty>
      <div class="py-12 flex flex-col items-center justify-center px-4">
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
    </template>

    <!-- Slot pour contenu personnalisé après les champs -->
    <template #after-fields>
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

      <!-- Prix total (calculé) -->
      <div class="p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
        <div class="text-sm text-gray-500 mb-1">Prix Total</div>
        <div class="text-xl font-bold text-primary-600 dark:text-primary-400">
          {{ totalPrice.toLocaleString("fr-FR") }} FCFA
        </div>
      </div>
    </template>
  </ModalForm>
</template>

<script setup lang="ts">
import { z } from "zod";
import { loadInventories } from "~/utils/inventories";
import type { Inventory } from "~/types/inventory";
import type { Category } from "~/types/category";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { post } = useApi();
const toast = useToast();
const authStore = useAuthStore();

// Sync open
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

// État chargement
const loading = ref(true);
const loadError = ref(false);

// Données
const inventories = ref<Array<{
  inventory_id: string;
  name: string;
  unit: string;
  category: string;
  category_name: string;
}>>([]);

// État du formulaire
const formState = ref<Record<string, any>>({});

// Catégories injectées depuis le parent
const injectedCategories = inject<Ref<Category[]>>("categories", ref([]));

// Configuration des champs
const fields = computed(() => [
  {
    name: "inventory_id",
    label: "Produit",
    type: "select" as const,
    required: true,
    placeholder: "Sélectionner un produit",
    options: inventories.value.map((inv) => ({
      label: inv.name,
      value: inv.inventory_id,
    })),
  },
  {
    name: "quantity",
    label: "Quantité",
    type: "number" as const,
    required: true,
    placeholder: "ex: 10",
    min: 1,
    class: "grid-cols-2",
  },
  {
    name: "price_per_unit",
    label: "Prix par unité (FCFA)",
    type: "number" as const,
    required: true,
    placeholder: "ex: 2500",
    min: 0,
    step: 0.01,
    class: "grid-cols-2",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea" as const,
    placeholder: "Ajouter des détails supplémentaires...",
  },
]);

// Schema Zod
const schema = z.object({
  inventory_id: z.string("Veuillez sélectionner un produit"),
  quantity: z.number("La quantité doit être d'au moins 1"),
  price_per_unit: z.number("Le prix doit être supérieur à 0"),
  notes: z.string().optional(),
});

// Produit sélectionné
const selectedInventory = computed(() => {
  const id = formState.value?.inventory_id;
  if (!id) return null;
  return inventories.value.find((inv) => inv.inventory_id === id);
});

// Prix total calculé
const totalPrice = computed(() => {
  const qty = formState.value?.quantity || 0;
  const price = formState.value?.price_per_unit || 0;
  return qty * price;
});

// Récupère le nom de catégorie
function getCategoryName(categoryId: string): string {
  if (!categoryId) return "Non catégorisé";
  const category = injectedCategories.value.find((cat) => cat.id === categoryId);
  return category?.name || "Non catégorisé";
}

// Chargement des données
async function loadData() {
  loading.value = true;
  loadError.value = false;
  try {
    const list = await loadInventories(toast);
    inventories.value = list.map((inv) => ({
      inventory_id: inv.inventory_id,
      name: inv.name,
      unit: inv.unit,
      category: inv.category || "",
      category_name: getCategoryName(inv.category || ""),
    }));
  } catch (err) {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

// Soumission
async function onSubmit(data: any) {
  const selected = inventories.value.find(
    (inv) => inv.inventory_id === data.inventory_id,
  );

  if (!selected) {
    toast.add({
      title: "Erreur",
      description: "Produit non trouvé.",
      color: "error",
    });
    return;
  }

  try {
    const purchaseData = {
      item_name: selected.name,
      quantity: data.quantity,
      unit: selected.unit,
      price_per_unit: data.price_per_unit,
      total_price: data.quantity * data.price_per_unit,
      purchase_date: new Date().toISOString().split("T")[0],
      category_id: selected.category,
      inventory_id: data.inventory_id,
      notes: data.notes || "",
      created_by: authStore.user?.id,
    };

    await post("/purchases", purchaseData);

    toast.add({
      title: "Succès",
      description: "L'achat a été créé avec succès.",
      color: "success",
    });

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création.",
      color: "error",
    });
  }
}

// Chargement à l'ouverture
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    loadData();
  }
});
</script>