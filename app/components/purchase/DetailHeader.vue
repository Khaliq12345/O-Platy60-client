<template>
  <BackButton class="mb-2" />
  <div
    class="px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
  >
    <div>
      <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {{ itemName }}
      </h1>
    </div>

    <div class="flex gap-3">
      <PurchaseEdit />
      <UButton
        size="sm"
        color="error"
        variant="outline"
        icon="i-heroicons-trash"
        label="Supprimer"
        @click="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  itemName: string;
  purchaseId: string;
}>();

const { delete: del } = useApi();
const toast = useToast();


async function handleDelete() {
  try {
    await del(`/purchases/${props.purchaseId}`)
    toast.add({
      title: 'Achat supprimé',
      description: "L'achat a été supprimé avec succès",
      color: 'success'
    })

    useRouter().push('/purchases')  
  } catch (error) {
    console.error('Error deleting purchase:', error)
    
    toast.add({
      title: 'Erreur',
      description: "Une erreur est survenue lors de la suppression de l'achat",
      color: 'error'
    })
  }
}

</script>
