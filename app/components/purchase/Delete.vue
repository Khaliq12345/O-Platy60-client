<template>
  <UModal
    v-model:open="isOpen"
    description="Supprimer l'achat"
    title="Supprime"
  >
    <UButton
      size="sm"
      color="neutral"
      variant="outline"
      icon="i-heroicons-trash"
      label="Supprimer"
    />

    <template #content>
      <div class="p-4">
        <SectionHeader title="Supprimer l'achat" />

        <!-- // Input for confirmer -->
        <UFormField
          label="Confirmer la suppression"
          help="Tapez le nom du produit pour supprimer l'achat"
          class="mt-2"
        >
          <UInput
            color="neutral"
            variant="subtle"
            :placeholder="itemName"
            v-model="confirmName"
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
          <UButton
            type="submit"
            color="primary"
            @click="handleDelete"
            :loading="loading"
            :disabled="loading"
            :class="loading ? 'animate-pulse' : ''"
          >
          {{ loading ? 'Suppression...' : 'Supprimer'}}
        </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const props = defineProps<{
  itemName: string;
  purchaseId: string;
}>();

const { delete: del } = useApi();
const toast = useToast();
const loading = ref(false);
const confirmName = ref("");
const router = useRouter();

async function handleDelete() {
  if (confirmName.value != props.itemName) {
    toast.add({
      title: "Erreur",
      description: "Validation echouer pour la suppression de l'achat",
      color: "error",
    });
    return;
  }
  loading.value = true;
  try {
    await del(`/purchases/${props.purchaseId}`);
    toast.add({
      title: "Achat supprimé",
      description: "L'achat a été supprimé avec succès",
      color: "success",
    });

    if (router.currentRoute.value.path === "/purchases") {
      window.location.reload();
    } else {
      router.push("/purchases");
    }
  } catch (error) {
    console.error("Error deleting purchase:", error);

    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de la suppression de l'achat",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>
