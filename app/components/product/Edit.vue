<template>
  <UModal v-model:open="isOpen" title="Modifier le Produit">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nom" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="ex: Sandwich Poulet"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Portion initiale" name="initial_portion" required>
            <UInputNumber
              v-model="state.initial_portion"
              :min="0"
              :step="0.1"
              placeholder="ex: 150"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Unité" name="unit" required>
            <USelect
              v-model="state.unit"
              :items="unitOptions"
              placeholder="Sélectionner"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Catégorie" name="category">
          <USelect
            v-model="state.category"
            :items="categoryOptions"
            placeholder="Sélectionner une catégorie (optionnel)"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Ingrédient de base" name="ingredient_id" required>
          <USelect
            v-model="state.ingredient_id"
            :items="ingredientOptions"
            placeholder="Sélectionner un ingrédient"
            class="w-full"
            disabled
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="soft"
          label="Annuler"
          @click="isOpen = false"
        />
        <UButton
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          label="Enregistrer"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Category } from "~/types/category";
import type { Ingredient } from "~/types/ingredient";
import { Measurement, type Product, type ProductUpdate } from "~/types/product";

const emit = defineEmits<{
  updated: [];
}>();

const isOpen = defineModel<boolean>("open");
const product = defineModel<Product>("product");

const { put } = useApi();
const toast = useToast();

const isSubmitting = ref(false);

const categories = inject<Ref<Category[]>>("categories", ref([]));
const ingredients = inject<Ref<Ingredient[]>>("ingredients", ref([]));

const unitOptions = [
  { label: "Kilogramme (kg)", value: Measurement.KG },
  { label: "Gramme (g)", value: Measurement.G },
  { label: "Litre (L)", value: Measurement.L },
  { label: "Unité", value: Measurement.UNIT },
  { label: "Cuillère à café (tsp)", value: Measurement.TSP },
  { label: "Cuillère à soupe (tbsp)", value: Measurement.TBSP },
];

const categoryOptions = computed(() => [
  { label: "Aucune", value: undefined },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);

const ingredientOptions = computed(() =>
  ingredients.value.map((ing) => ({ label: ing.name, value: ing.id }))
);

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  initial_portion: z.number().min(0.1, "La portion doit être supérieure à 0"),
  unit: z.nativeEnum(Measurement, {
    errorMap: () => ({ message: "Veuillez sélectionner une unité" }),
  }),
  category: z.string().optional(),
  ingredient_id: z.string(),
});

const state = reactive<ProductUpdate>({
  name: "",
  initial_portion: 0,
  unit: Measurement.UNIT,
  category: undefined,
});

// Sync avec le produit à éditer
watch(
  () => product.value,
  (newProduct) => {
    if (newProduct) {
      state.name = newProduct.name;
      state.initial_portion = newProduct.initial_portion;
      state.unit = newProduct.unit;
      state.category = newProduct.category;
    }
  },
  { immediate: true }
);

async function onSubmit() {
  if (!product.value?.product_id) return;

  isSubmitting.value = true;
  try {
    await put(`/products/${product.value.product_id}`, {
      name: state.name,
      initial_portion: state.initial_portion,
      unit: state.unit,
      category: state.category,
    });

    toast.add({
      title: "Succès",
      description: "Produit mis à jour",
      color: "success",
    });

    isOpen.value = false;
    emit("updated");
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de mettre à jour le produit",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>