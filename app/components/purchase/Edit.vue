<template>
  <UModal v-model:open="isOpen" description="Modifier l'achat">
    <UButton
      size="sm"
      color="neutral"
      variant="outline"
      icon="i-heroicons-pencil"
      label="Modifier"
      @click="isOpen = true"
    />

    <template #content>
      <div class="p-4">
        <SectionHeader title="Modifier l'achat" />
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 p-4"
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

          <!-- Quantité et prix par unité -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Quantité" name="quantity" required>
              <UInputNumber
                v-model="state.quantity"
                :min="1"
                placeholder="ex: 10"
                class="w-full"
              />
            </UFormField>

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
          </div>

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
              label="Fermer"
              @click="isOpen = false"
            />
            <UButton type="submit" color="primary" label="Sauvegarder" />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Category } from "~/types/category";
import type { PurchaseItem } from "~/types/purchase";

const isOpen = ref(false);
const purchase = ref<PurchaseItem>();
const purchaseId = useRoute().params.id;
const { get, put } = useApi();

// Schéma Zod de validation
const schema = z.object({
  item_name: z.string("Nom de l'achat invalide").min(2, "Le nom doit contenir au moins 2 caractères"),
  quantity: z.number("Quantité invalide").min(1, "La quantité doit être d'au moins 1"),
  price_per_unit: z.number("Prix par unité invalide").min(0.01, "Le prix doit être supérieur à 0"),
  category_id: z.string("Catégorie invalide").min(1, "La catégorie est requise"),
  notes: z.string().optional(),
});

type Schema = z.output<typeof schema>;

// État du formulaire
const state = reactive<Partial<Schema>>({
  item_name: "",
  quantity: 0,
  price_per_unit: 0,
  category_id: "",
  notes: "",
});

// Catégories dynamiques
const categories = ref<{ label: string; value: string }[]>([]);

const toast = useToast();

// Soumission du formulaire
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await put(`/purchases/${purchaseId}`, event.data);
    toast.add({
      title: "Succès",
      description: "L'achat a été modifié avec succès.",
      color: "success",
    });

    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la modification.",
      color: "error",
    });
  }
}

// Watch pour mettre à jour le formulaire quand purchase est chargé
watch(purchase, (newPurchase) => {
  if (newPurchase) {
    state.item_name = newPurchase.item_name;
    state.quantity = newPurchase.quantity;
    state.price_per_unit = newPurchase.price_per_unit;
    state.category_id = newPurchase.category_id;
    state.notes = newPurchase.notes || "";
  }
}, { immediate: true })

// Charger les catégories + l'achat
onMounted(async () => {
  const response = await get<Category[]>("/categories");
  categories.value = response.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
  purchase.value = await get<PurchaseItem>(`/purchases/${purchaseId}`);
});
</script>
