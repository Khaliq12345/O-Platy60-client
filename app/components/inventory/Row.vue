<template>
  <div class="hidden md:block">
    <InventoryRowDesktop 
      :item="item" 
      :days="days" 
      @update-sale="handleSaleUpdate"
    />
  </div>
  <div class="md:hidden">
    <InventoryRowMobile 
      :item="item" 
      :days="days" 
      @update-sale="handleSaleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import type { Inventory } from "~/types/inventory";
import type { DayData } from "~/types/inventory";

const props = defineProps<{
  item: Inventory;
  days: DayData[];
}>();

const { post } = useApi();
const toast = useToast();

const handleSaleUpdate = async (data: { 
  date: string; 
  sale: number;
  transactionId?: number;
}) => {
  try {
    // La date est déjà au format YYYY-MM-DD
    const payload = {
      inventory_id: props.item.inventory_id,
      sale: data.sale,
      created_at: data.date, // Le backend ajoutera l'heure
    };
    
    await post(`/inventories/transactions`, payload);
    
    toast.add({
      title: "Succès",
      description: "Vente enregistrée",
      color: "success",
    });
    
    emit('transactionUpdated', props.item.inventory_id);
    
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible d'enregistrer la vente",
      color: "error",
    });
  }
};

const emit = defineEmits<{
  transactionUpdated: [inventoryId: string];
}>();
</script>