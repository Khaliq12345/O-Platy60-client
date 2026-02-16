<template>
  <UCollapsible class="flex flex-col gap-2">
    <UButton
      class="font-medium"
      color="neutral"
      variant="subtle"
      :trailing-icon="open ? 'i-lucide-minus' : 'i-lucide-plus'"
      block
      @click="open = !open"
    >
      Ajouter un élément à l'inventaire
    </UButton>

    <template #content>
      <UForm
        :schema="schema" 
        :state="state"
        @submit="onSubmit"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg border-default"
      >
        <UFormField label="Nom du produit" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Entrez le nom du produit"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Quantité initiale" name="initial_quantity">
          <UInputNumber
            v-model="state.initial_quantity"
            :min="0"
            placeholder="0"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Mesure" name="unit" required>
          <USelect
            v-model="state.unit"
            :items="units"
            placeholder="Sélectionner une unité"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Catégorie" name="category" required>
          <USelect
            v-model="state.category"
            :items="categories"
            placeholder="Sélectionner une catégorie"
            class="w-full"
          />
        </UFormField>

        <div class="md:col-span-2 md:px-4 flex justify-center">
          <UButton type="submit" color="primary" :loading="processing"> Ajouter le produit </UButton>
        </div>
      </UForm>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { number, z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

// Types
interface Category {
  id: string;
  name: string;
}
const emit = defineEmits<{
  added: [];
}>();

// État réactif
const open = ref(false);
const loading = ref(true);
const categories = ref<{ label: string; value: string }[]>([]);
const processing = ref(false)

// Composables
const { get, post } = useApi();
const toast = useToast();

// Schéma de validation Zod
const schema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
  initial_quantity: z.number().min(0, "La quantité doit être positive").int(),
  unit: z.string().min(1, "Veuillez sélectionner une unité"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

type Schema = z.output<typeof schema>;
// État du formulaire
const state = reactive<Partial<Schema>>({
  name: "",
  initial_quantity: 0,
  unit: "",
  category: "",
});

// Données statiques
const units = [
  { label: "Pièce", value: "pièce" },
  { label: "Kilogramme", value: "kg" },
  { label: "Litre", value: "L" },
  { label: "Mètre", value: "m" },
  { label: "Ramette", value: "ramette" },
  { label: "Forfait", value: "forfait" },
];

// Soumission du formulaire
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  processing.value = true;
  try {
    console.log("Produit ajouté:", event.data);

    // Ici vous pouvez faire votre appel API
    await post("/inventories", { ...event.data, created_at: getDate() });
    toast.add({
      title: "Succès",
      description: "Le produit a été ajouté avec succès.",
      color: "success",
    });

    // Reset du formulaire
    Object.assign(state, {
      name: "",
      initial_quantity: 0,
      unit: "",
      category: "",
    });

    emit("added");
    open.value = false;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'ajout du produit.",
      color: "error",
    });
  }
  processing.value = false;
};

// Chargement des catégories
onMounted(async () => {
  try {
    const response = await get<{categories: Category[], count: number}>("/categories");
    categories.value = response.categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  } catch (err) {
    console.error("Erreur lors du chargement des catégories:", err);
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les catégories.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
});
</script>
