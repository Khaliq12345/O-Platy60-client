<template>
  <UModal v-model:open="isOpen">
    <template #title>
      Nouveau Produit
    </template>

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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          @click="isOpen = false"
        />
        <UButton
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || !isValid"
          label="Créer"
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
import { Measurement, type ProductCreate } from "~/types/product";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { post } = useApi();
const toast = useToast();

const isSubmitting = ref(false);

const categories = inject<Ref<Category[]>>("categories", ref([]));
const ingredients = inject<Ref<Ingredient[]>>("ingredients", ref([]));

// Sync avec v-model:open
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

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
  unit: z.enum(Measurement, {
    errorMap: () => ({ message: "Veuillez sélectionner une unité" }),
  }),
  category: z.string().optional(),
  ingredient_id: z.string().min(1, "L'ingrédient de base est requis"),
});

const state = reactive<Partial<ProductCreate>>({
  name: "",
  initial_portion: undefined,
  unit: undefined,
  category: undefined,
  ingredient_id: undefined,
});

const isValid = computed(() => {
  return state.name && state.initial_portion && state.unit && state.ingredient_id;
});

async function onSubmit() {
  if (!isValid.value) {
    toast.add({
      title: "Erreur",
      description: "Veuillez remplir tous les champs obligatoires",
      color: "error",
    });
    return;
  }

  isSubmitting.value = true;
  try {
    await post("/products", {
      name: state.name,
      initial_portion: state.initial_portion,
      unit: state.unit,
      category: state.category,
      ingredient_id: state.ingredient_id,
    });

    toast.add({
      title: "Succès",
      description: "Produit créé avec succès",
      color: "success",
    });

    // Reset form
    state.name = "";
    state.initial_portion = undefined;
    state.unit = undefined;
    state.category = undefined;
    state.ingredient_id = undefined;

    isOpen.value = false;
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de créer le produit",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>