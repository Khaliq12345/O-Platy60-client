<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
  >
    <slot name="trigger">
      <UButton
        size="sm"
        color="error"
        variant="ghost"
        icon="i-heroicons-trash"
        :label="triggerLabel"
      />
    </slot>

    <template #content>
      <div class="p-4 space-y-4">
        <p v-if="message" class="text-sm text-gray-600 dark:text-gray-400">
          {{ message }}
        </p>

        <UFormField
          :label="`Tapez '${confirmText}' pour confirmer`"
          class="w-full"
        >
          <UInput
            v-model="confirmInput"
            :placeholder="confirmText"
            color="neutral"
            variant="subtle"
            class="w-full"
            @keyup.enter="handleDelete"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Annuler"
            @click="isOpen = false"
          />
          <UButton
            color="error"
            :loading="loading"
            :disabled="!canDelete || loading"
            @click="handleDelete"
          >
            {{ loading ? 'Suppression...' : 'Supprimer' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  itemName: string;
  itemId: string;
  apiEndpoint: string;
  title?: string;
  description?: string;
  message?: string;
  triggerLabel?: string;
  confirmText?: string;
  redirectTo?: string;
  reloadOnDelete?: boolean;
}>();

const emit = defineEmits<{
  deleted: [itemId: string];
}>();

const { delete: del } = useApi();
const toast = useToast();
const router = useRouter();

const isOpen = defineModel("open", { default: false });
const loading = ref(false);
const confirmInput = ref("");

const title = computed(() => props.title ?? `Supprimer ${props.itemName}`);
const description = computed(() => props.description ?? "Cette action est irréversible");
const confirmText = computed(() => props.confirmText ?? props.itemName);
const triggerLabel = computed(() => props.triggerLabel ?? "");

const canDelete = computed(() => confirmInput.value === confirmText.value);

async function handleDelete() {
  if (!canDelete.value) {
    toast.add({
      title: "Erreur",
      description: "Le texte de confirmation ne correspond pas",
      color: "error",
    });
    return;
  }

  loading.value = true;
  
  try {
    await del(`${props.apiEndpoint}/${props.itemId}`);
    
    toast.add({
      title: "Succès",
      description: `"${props.itemName}" a été supprimé`,
      color: "success",
    });

    emit("deleted", props.itemId);
    
    if (props.reloadOnDelete) {
      window.location.reload();
    } else if (props.redirectTo) {
      await router.push(props.redirectTo);
    }
    
    isOpen.value = false;
    confirmInput.value = "";
    
  } catch (error) {
    console.error("Erreur de suppression:", error);
    toast.add({
      title: "Erreur",
      description: "La suppression a échoué",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

watch(isOpen, (open) => {
  if (!open) confirmInput.value = "";
});
</script>