<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">Nouvelle Transformation</h3>

    <TransformationForm
      ref="formRef"
      :unit="purchase.unit"
      :max-quantity="purchase.quantity"
      :initial-data="{
        quantity_received: purchase.quantity,
        waste_quantity: 0,
      }"
      submit-label="Créer"
      submit-color="primary"
      submit-icon="i-heroicons-plus-circle"
      @submit="onSubmit"
      @cancel="$emit('cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";

const props = defineProps<{
  purchase: PurchaseItem;
}>();

const emit = defineEmits<{
  added: [];
  cancel: [];
}>();

const { post } = useApi();
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
      product_name: props.purchase.item_name,
      quantity_received: formData.quantity_received,
      quantity_usable: formData.quantity_usable,
      waste_quantity: formData.waste_quantity,
      transformation_date: new Date().toISOString().split("T")[0],
      notes: formData.notes,
      purchase_id: props.purchase.id,
      created_by: "42ad2622-23a6-4fce-91fd-4c1996bb2902",
      unit: props.purchase.unit,
    };

    const response = await post("/transformations", payload);

    toast.add({
      title: "Succès",
      description: "Transformation créée",
      color: "success",
    });

    emit("added");
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description:
        error?.response?._data?.message || "Erreur lors de la création",
      color: "error",
    });
  } finally {
    // Reset le loading dans le form
    formRef.value?.resetSubmitting();
  }
};
</script>
