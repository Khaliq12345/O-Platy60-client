<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="h-screen flex items-center justify-center">
      <Loading />
    <!-- Form -->
    </div>
    <div v-else-if="categories.length > 0" class="max-w-2xl mx-auto px-4 py-8">
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
      <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Nouvel Achat
      </h1>

      <!-- Formulaire -->
      <div>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-6"
          @submit="onSubmit"
        >
          <!-- Nom de l'article -->
          <UFormField label="Nom de l'article" name="item_name" required>
            <UInput
              v-model="state.item_name"
              placeholder="Rechercher ou créer un article..."
              class="w-full"
            />
          </UFormField>

          <!-- Catégorie -->
          <UFormField label="Catégorie" name="category_id" required>
            <USelect
              v-model="state.category_id"
              :items="categories"
              placeholder="Sélectionner une catégorie"
              class="w-full"
            />
          </UFormField>

          <!-- Quantité et Unité -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Quantité" name="quantity" required>
              <UInputNumber
                v-model="state.quantity"
                :min="1"
                placeholder="ex: 10"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Unité" name="unit" required>
              <USelect
                v-model="state.unit"
                :items="units"
                placeholder="Sélectionner une unité"
                class="w-full"
              />
            </UFormField>
          </div>

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
            />
          </UFormField>

          <!-- Boutons -->
          <div class="flex justify-end gap-3 pt-4">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              label="Annuler"
              @click="onCancel"
            />
            <UButton type="submit" color="primary" label="Enregistrer" />
          </div>
        </UForm>
      </div>
    </div>
    <!-- Empty -->
    <div v-else>
      <UEmpty icon="i-lucide-circle-minus" title="Impossible de charger les catérogies.">
        <template #action>
          <UButton
                icon="i-lucide-arrow-up-right"
                variant="subtle"
                :to="`/purchases`"
                >Rediriger vers achats</UButton
              >
        </template>
      </UEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Category } from "~/types/category";

const router = useRouter();
const { get, post } = useApi();
const loading = ref(true)

// Schéma Zod de validation
const schema = z.object({
  item_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
  unit: z.string().min(1, "L'unité est requise"),
  price_per_unit: z.number().min(0.01, "Le prix doit être supérieur à 0"),
  category_id: z.string().min(1, "La catégorie est requise"),
  notes: z.string().optional(),
});

type Schema = z.output<typeof schema>;

// État du formulaire
const state = reactive<Partial<Schema>>({
  item_name: "",
  quantity: undefined,
  unit: undefined,
  price_per_unit: undefined,
  category_id: "",
  notes: "",
});

// Calcul du prix total
const totalPrice = computed(() => {
  if (!state.quantity || !state.price_per_unit) return 0;
  return state.quantity * state.price_per_unit;
});

// Catégories dynamiques
const categories = ref<{ label: string; value: string }[]>([]);

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
    const purchaseData = {
      ...event.data,
      total_price: totalPrice.value,
      purchase_date: new Date().toISOString().split("T")[0],
      created_by: "42ad2622-23a6-4fce-91fd-4c1996bb2902",
    };

    await post("/purchases/", purchaseData);

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
  }
}

// Annuler et retour
function onCancel() {
  router.push("/purchases");
}

// Charger les catégories
onMounted(async () => {
  try {
    const response = await get<Category[]>("/categories");
    categories.value = response.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  } catch(err) {
    console.error("Erreur lors du chargement des catégories:", err);
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors du chargement des catégories.",
      color: "error",
    });
  }
  loading.value = false;
});
</script>
