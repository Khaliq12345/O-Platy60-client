<template>
  <ModalForm
    v-model:open="isOpen"
    v-model:modelValue="formData"
    title="Nouvel Achat"
    :fields="fields"
    :schema="schema"
    :loading="loading"
    :load-error="loadError"
    :is-empty="inventories.length === 0"
    submit-label="Enregistrer"
    @submit="onSubmit"
    @reload="loadInventories"
  >
    <template #empty>
      <div class="py-12 text-center">
        <UIcon name="i-lucide-circle-minus" class="w-12 h-12 text-gray-400 mb-4" />
        <h2 class="text-lg font-semibold mb-2">Aucun produit disponible</h2>
        <p class="text-gray-500 mb-4">Créez d'abord un produit dans l'inventaire.</p>
        <UButton color="primary" icon="i-lucide-arrow-up-right" label="Créer" to="/inventories" />
      </div>
    </template>

    <template #after-fields>
      <div v-if="selectedInventory" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
        <div class="grid grid-cols-2 gap-2">
          <div><span class="text-gray-500">Catégorie:</span> {{ selectedInventory.category_name }}</div>
          <div><span class="text-gray-500">Unité:</span> {{ selectedInventory.unit }}</div>
        </div>
      </div>
      <div class="p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
        <div class="text-sm text-gray-500">Prix Total</div>
        <div class="text-xl font-bold text-primary-600">{{ totalPrice.toLocaleString("fr-FR") }} FCFA</div>
      </div>
    </template>
  </ModalForm>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Inventory } from "~/types/inventory";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [boolean] }>();

const { post } = useApi();
const toast = useToast();
const authStore = useAuthStore();

const isOpen = computed({ get: () => props.open, set: (v) => emit("update:open", v) });

const loading = ref(false);
const loadError = ref(false);
const inventories = ref<Inventory[]>([]);
const formData = ref<Record<string, any>>({});

// Chargement des inventaires
async function loadInventories() {
  loading.value = true;
  try {
    const { get } = useApi();
    const res = await get<{ inventories: Inventory[] }>("/inventories");
    inventories.value = res.inventories;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

// Configuration des champs
const fields = computed(() => [
  { name: "inventory_id", label: "Produit", type: "select" as const, required: true, 
    options: inventories.value.map(i => ({ label: i.name, value: i.inventory_id })) },
  { name: "quantity", label: "Quantité", type: "number" as const, required: true, min: 1 },
  { name: "price_per_unit", label: "Prix par unité (FCFA)", type: "number" as const, required: true, min: 0, step: 0.01 },
  { name: "notes", label: "Notes", type: "textarea" as const },
]);

const schema = z.object({
  inventory_id: z.string().min(1, "Produit requis"),
  quantity: z.number().min(1, "Quantité minimale: 1"),
  price_per_unit: z.number().min(0.01, "Prix requis"),
  notes: z.string().optional(),
});

// Computed basés sur formData (synchronisé avec ModalForm)
const selectedInventory = computed(() => 
  inventories.value.find(i => i.inventory_id === formData.value.inventory_id)
);

const totalPrice = computed(() => 
  (formData.value.quantity || 0) * (formData.value.price_per_unit || 0)
);

// Soumission
async function onSubmit(data: any) {
  const inv = selectedInventory.value;
  if (!inv) return toast.add({ title: "Erreur", description: "Produit non trouvé", color: "error" });

  try {
    await post("/purchases", {
      item_name: inv.name,
      quantity: data.quantity,
      unit: inv.unit,
      price_per_unit: data.price_per_unit,
      total_price: totalPrice.value,
      purchase_date: new Date().toISOString().split("T")[0],
      category_id: inv.category,
      inventory_id: data.inventory_id,
      notes: data.notes || "",
      created_by: authStore.user?.id,
    });

    toast.add({ title: "Succès", description: "Achat créé", color: "success" });
    isOpen.value = false;
    window.location.reload();
  } catch {
    toast.add({ title: "Erreur", description: "Création échouée", color: "error" });
  }
}

// Chargement à l'ouverture
watch(() => props.open, (open) => open && loadInventories());
</script>