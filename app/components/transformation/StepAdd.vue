<template>
  <div class="mx-auto text-wrap my-2 px-2" variant="naked">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Produit" name="product_id" required>
        <USelect
          v-model="state.product_id"
          :items="productOptions"
          placeholder="Sélectionner un produit..."
          class="w-full"
          :loading="loadingProducts"
          :disabled="loadingProducts"
        />
      </UFormField>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <UFormField label="Portions" name="portions" required>
          <UInputNumber
            v-model="state.portions"
            placeholder="Nombre de portions"
            class="w-full"
            :step="1"
          />
        </UFormField>

        <UFormField label="Quantité utilisée" name="quantity" required>
          <UInputNumber
            v-model="state.quantity"
            placeholder="Entrer la quantité"
            class="w-full"
            :step="1"
          />
        </UFormField>
      </div>

      <div class="w-full flex items-center justify-center">
        <UButton
          type="submit"
          color="primary"
          size="sm"
          icon="i-heroicons-check-circle"
          :loading="loading"
          :disabled="loading || loadingProducts"
          :class="loading ? 'animate-pulse' : ''"
        >
          {{ loading ? "Ajout..." : "Ajouter" }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Transformation } from "~/types/transformation";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  transformation: Transformation;
}>();

const { get, post } = useApi();
const toast = useToast();
const emit = defineEmits<{ added: [] }>();

// Chargement des produits
const products = ref<Array<{ id: string; name: string }>>([]);
const loadingProducts = ref(true);

async function loadProducts() {
  loadingProducts.value = true;
  try {
    const response = await get<{ products: Array<{ product_id: string; name: string }> }>("/products");
    products.value = response.products.map(p => ({
      id: p.product_id,
      name: p.name,
    }));
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les produits",
      color: "error",
    });
  } finally {
    loadingProducts.value = false;
  }
}

// Options pour le select
const productOptions = computed(() => 
  products.value.map(p => ({
    label: p.name,
    value: p.id, // ID comme valeur
  }))
);

// Récupère le nom du produit sélectionné
const selectedProductName = computed(() => {
  const product = products.value.find(p => p.id === state.product_id);
  return product?.name || "";
});

// Schéma avec validation du stock max
const schema = z.object({
  product_id: z.string().min(1, "Produit requis"),

  portions: z.coerce
    .number()
    .min(1, "Minimum 1 portion")
    .int("Doit être un nombre entier"),

  quantity: z.coerce
    .number()
    .min(0.01, "Minimum 0.01")
    .positive("Doit être positif")
    .refine(
      (quantity) => {
        const remaining = props.transformation.remaining_quantity;
        return remaining == null || typeof remaining !== "number"
          ? false
          : quantity <= remaining;
      },
      {
        message: () => {
          const remaining = props.transformation.remaining_quantity;
          return typeof remaining === "number"
            ? `Stock insuffisant (${remaining} restants)`
            : "Données de stock indisponibles";
        },
      },
    ),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  product_id: undefined,
  portions: undefined,
  quantity: undefined,
});

const loading = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  try {
    const payload = {
      ...event.data,
      step_name: selectedProductName.value, // Ajoute le nom du produit ici
      transformation_id: props.transformation.id,
    };

    await post("/transformation-steps/", payload);

    toast.add({
      title: "Succès",
      description: "Étape ajoutée avec succès",
      color: "success",
    });

    // Reset
    state.product_id = undefined;
    state.portions = undefined;
    state.quantity = undefined;

    emit("added");
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: error?.response?._data?.message || "Erreur lors de la création",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

// Chargement initial
onMounted(() => {
  loadProducts();
});
</script>