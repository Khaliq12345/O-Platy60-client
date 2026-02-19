<template>
  <!-- COmponent to calculate summary -->
  <UCollapsible v-model:open="isOpen">
    <template #content>
      <div class="px-2 pb-2 pt-2 rounded-md bg-gray-50/50 dark:bg-gray-800/30">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Metrics weekly  -->
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl"
          >
            <p class="text-xs text-gray-500 uppercase mb-1">
              {{ stat.label }}
            </p>

            <!-- Input manuel du stock/portion -->
            <UInputNumber
              v-if="stat.isInput"
              v-model="manualQty"
              :min="0"
              size="lg"
              class="w-full"
              color="primary"
            />

            <!-- Only show if not input -->
            <div v-else class="text-2xl font-semibold" :class="stat.color">
              {{ stat.displayValue }}
            </div>
          </div>

          <!-- Action to start the weekly summary calculations -->
          <div class="mb-2 w-full col-span-full flex justify-center">
            <UButton
              label="Calculer le sommaire"
              :loading="loading"
              @click="calculateSummary"
            />
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import type { InventoryWeeklySummary } from "~/types/inventory";

const isOpen = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  inventoryId: string;
  startDate: string;
  endDate: string;
}>();

const { post } = useApi();
const toast = useToast();

// Defining the reactive variables
const loading = ref(false);
const manualQty = ref<number | null>(null);
const summary = ref<InventoryWeeklySummary | null>(null);

// Defining the computed
const stats = computed(() => [
  {
    label: "Total ventes",
    displayValue: summary.value?.total_sales ?? "—",
    color: "text-rose-500",
    isInput: false,
  },
  {
    label: "Stock final",
    displayValue: summary.value?.final_quantity ?? "—",
    color: "text-primary",
    isInput: false,
  },
  {
    label: "Inventaire",
    isInput: true,
  },
  {
    label: "Différence",
    displayValue: summary.value?.calculated_diff ?? "—",
    color: "text-gray-900 dark:text-white",
    isInput: false,
  },
]);

// All functions
async function calculateSummary() {
  if (!manualQty.value) {
    toast.add({
      title: "Erreur",
      description: "Veuillez saisir l'inventaire manuel",
      color: "error",
    });
    return;
  }

  loading.value = true;
  try {
    summary.value = await post<InventoryWeeklySummary>(
      "/inventories/weekly-summary",
      {
        inventory_id: props.inventoryId,
        start_date: props.startDate,
        end_date: props.endDate,
        manual_qty: manualQty.value,
      },
    );

    toast.add({
      title: "Succès",
      description: "Sommaire calculé",
      color: "success",
    });
  } catch {
    toast.add({
      title: "Erreur",
      description: "Calcul impossible",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>
