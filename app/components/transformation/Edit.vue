<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">Modifier la Transformation</h3>

    <TransformationForm
      ref="formRef"
      :unit="transformation.unit"
      :max-quantity="purchase.quantity"
      :initial-data="{
        quantity_received: transformation.quantity_received,
        waste_quantity: transformation.waste_quantity,
        notes: transformation.notes,
      }"
      submit-label="Enregistrer"
      submit-color="warning"
      submit-icon="i-heroicons-pencil-square"
      @submit="onSubmit"
      @cancel="$emit('cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Transformation } from "~/types/transformation";
import type { PurchaseItem } from "~/types/purchase";

const props = defineProps<{
  transformation: Transformation;
  purchase: PurchaseItem;
}>();

const emit = defineEmits<{
  edited: [];
  cancel: [];
}>();

const { put } = useApi();
const toast = useToast();
const formRef = ref();

const onSubmit = async (formData: {
  quantity_received: number;
  quantity_usable: number;
  waste_quantity: number;
  notes?: string;
}) => {
  try {
    const payload = {
      quantity_received: formData.quantity_received,
      quantity_usable: formData.quantity_usable,
      waste_quantity: formData.waste_quantity,
      notes: formData.notes,
    };

    const response = await put(
      `/transformations/${props.transformation.id}`,
      payload,
    );

    toast.add({
      title: "Succès",
      description: "Transformation mise à jour",
      color: "success",
    });

    emit("edited");
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description:
        error?.response?._data?.message || "Erreur lors de la modification",
      color: "error",
    });
  } finally {
    formRef.value?.resetSubmitting();
  }
};
</script>
