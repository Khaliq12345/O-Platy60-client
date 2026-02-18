<template>
  <UModal v-model:open="isOpen">
    <template #title>
      Ajouter un élément à l'inventaire
    </template>

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        @submit="onSubmit"
        class="space-y-4"
      >
        <UFormField label="Nom du produit" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Entrez le nom du produit"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <UFormField label="Catégorie" name="category" required>
          <USelect
            v-model="state.category"
            :items="categories"
            placeholder="Sélectionner une catégorie"
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
          :loading="processing"
          :disabled="processing"
          label="Ajouter"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

interface Category {
  id: string;
  name: string;
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const processing = ref(false);
const categories = ref<{ label: string; value: string }[]>([]);

const { get, post } = useApi();
const toast = useToast();

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

const state = reactive<Partial<Schema>>({
  name: "",
  initial_quantity: 0,
  unit: "",
  category: "",
});

const units = [
  { label: "Pièce", value: "pièce" },
  { label: "Kilogramme", value: "kg" },
  { label: "Litre", value: "L" },
  { label: "Mètre", value: "m" },
  { label: "Ramette", value: "ramette" },
  { label: "Forfait", value: "forfait" },
];

const onSubmit = async () => {
  processing.value = true;
  try {
    await post("/inventories", { ...state, created_at: new Date().toISOString() });
    
    toast.add({
      title: "Succès",
      description: "Le produit a été ajouté avec succès.",
      color: "success",
    });

    // Reset form
    Object.assign(state, {
      name: "",
      initial_quantity: 0,
      unit: "",
      category: "",
    });

    isOpen.value = false;
    
    // Reload la page après création
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'ajout du produit.",
      color: "error",
    });
  } finally {
    processing.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await get<{ categories: Category[]; count: number }>("/categories");
    categories.value = response.categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  } catch (err) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les catégories.",
      color: "error",
    });
  }
});
</script>