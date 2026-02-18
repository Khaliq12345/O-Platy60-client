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
    <div v-else class="max-w-2xl mx-auto px-4 py-8">
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
        Nouvel Ingrédient
      </h1>

      <!-- Formulaire avec loading -->
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-6"
        @submit="onSubmit"
      >
        <!-- Nom de l'ingrédient -->
        <UFormField label="Nom" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="ex: Farine de blé"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Catégorie -->
        <UFormField label="Catégorie" name="category">
          <USelect
            v-model="state.category"
            :items="categoryItems"
            placeholder="Sélectionner une catégorie (optionnel)"
            class="w-full"
            :disabled="isSubmitting || loadingCategories"
            :loading="loadingCategories"
          />
        </UFormField>

        <!-- Unité de mesure -->
        <UFormField label="Unité de mesure" name="unit" required>
          <USelect
            v-model="state.unit"
            :items="measurementItems"
            placeholder="Sélectionner une unité"
            class="w-full"
            :disabled="isSubmitting"
          />
        </UFormField>

        <!-- Quantité totale -->
        <UFormField label="Quantité totale" name="total_quantity" required>
          <UInputNumber
            v-model="state.total_quantity"
            placeholder="ex: 5000"
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
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Category } from "~/types/category";
import { Mesurement, type IngredientCreate } from "~/types/ingredient";

const router = useRouter();
const { get, post } = useApi();
const toast = useToast();

const loading = ref(true);
const loadError = ref(false);
const isSubmitting = ref(false);
const loadingCategories = ref(false);

// Items pour le select des unités de mesure
const measurementItems = [
  { label: "Kilogramme (kg)", value: Mesurement.KG },
  { label: "Gramme (g)", value: Mesurement.G },
  { label: "Litre (L)", value: Mesurement.L },
  { label: "Unité", value: Mesurement.UNIT },
  { label: "Cuillère à café (tsp)", value: Mesurement.TSP },
  { label: "Cuillère à soupe (tbsp)", value: Mesurement.TBSP },
];

// Schéma Zod de validation
const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  unit: z.enum(Mesurement, {
    errorMap: () => ({ message: "Veuillez sélectionner une unité de mesure" }),
  }),
  category: z.string().optional(),
  total_quantity: z.number().min(1, "La quantité totale est requise"),
});

type Schema = z.output<typeof schema>;

// État du formulaire
const state = reactive<Partial<Schema>>({
  name: "",
  unit: undefined,
  category: undefined,
  total_quantity: 0,
});

// Catégories pour le select
const categories = ref<Category[]>([]);
const categoryItems = computed(() => {
  return categories.value.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
});

// Charger les catégories
async function loadCategories() {
  loadingCategories.value = true;
  try {
    const response = await get<{ categories: Category[]; count: number }>(
      "/categories"
    );
    categories.value = response?.categories ?? [];
  } catch (err) {
    console.error("Erreur lors du chargement des catégories:", err);
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les catégories.",
      color: "error",
    });
  } finally {
    loadingCategories.value = false;
  }
}

// Initialisation
async function loadData() {
  loading.value = true;
  loadError.value = false;

  try {
    await loadCategories();
  } catch (err) {
    console.error("Erreur lors du chargement:", err);
    loadError.value = true;
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les données.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function reloadData() {
  loadData();
}

// Soumission du formulaire
async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true;

  try {
    const ingredientData: IngredientCreate = {
      name: event.data.name,
      unit: event.data.unit,
      category: event.data.category,
      total_quantity: event.data.total_quantity,
    };

    await post("/ingredients", ingredientData);

    toast.add({
      title: "Succès",
      description: "L'ingrédient a été créé avec succès.",
      color: "success",
    });

    router.push("/ingredients");
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

// Annuler et retour
function onCancel() {
  router.push("/ingredients");
}

onMounted(() => {
  loadData();
});
</script>