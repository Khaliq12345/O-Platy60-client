<template>
  <UCard>
    <!-- // The title of the section -->
    <template #header>
      <div class="flex items-center justify-between">
        <SectionHeader title="Transformation" />
        <UButton size="sm" @click="edit = !edit">Modifier</UButton>
      </div>
    </template>

    <!-- // Show this when data is loading -->
    <Loading v-if="loading" />

    <!-- // Show this if there's no transformation -->
    <div v-else-if="!transformation" class="space-y-4">
      <p class="text-gray-500 dark:text-gray-400">
        Aucune transformation n'a été effectuée pour cet achat.
      </p>
      <PurchaseTransformationAdd :purchase="purchase" />
    </div>

    <!-- // Show this is there's transformation -->
    <div v-if="transformation" class="space-y-3">
      <!-- // Show the transformation metrics -->
      <PurchaseTransformationEdit
        v-if="edit"
        :transformation="transformation"
        :unit="transformation.unit"
        @cancel="edit = false"
      />

      <PurchaseTransformationDetail
        v-else
        :transformation="transformation"
        :unit="transformation.unit"
      />

      <!-- // container to add new transformation -->
      <div v-if="transformation.remaining_quantity > 0" class="mt-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
        <h2 class="font-bold">Ajoutez des transformations</h2>
        <PurchaseTransformationAddStep :transformation="transformation" />
      </div>
      <div v-else class="text-primary text-center text-sm">
        Vous ne pouvez plus ajouter de transformation pour ce achat
      </div>

      <PurchaseTransformationList
        :transformation="transformation"
        :transformation-id="transformation.id"
      />

      <PurchaseTransformationFooter :transformation="transformation" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  purchaseId: string;
  purchase: PurchaseItem;
}>();
const quantityReceived = defineModel("quantityReceived");
const quantityUsed = defineModel("quantityUsed");
const quantityRemaining = defineModel("quantityRemaining");

//variables to store the transformation
const transformation = ref<Transformation | undefined>();
const transformationMetrics = computed(() => {
  // Shortcut to the value for cleaner code
  const t = transformation.value;

  return [
    {
      title: "Reçu",
      value: t?.quantity_received?.toLocaleString(),
      badgeValue: t?.unit || "kg",
      color: "gray",
    },
    {
      title: "Utilisable",
      value: t?.quantity_usable?.toLocaleString(),
      badgeValue: t?.unit || "kg",
      color: "green", // Keeping green from your HTML, or change to "gray" if preferred
    },
    {
      title: "Déchet",
      value: t?.waste_quantity?.toLocaleString(),
      badgeValue: t?.unit || "kg",
      color: (t?.waste_quantity ?? 0) > 0 ? "orange" : "gray",
    },
  ];
});

const edit = ref(false);
const loading = ref(true);

// initialise the requests instance
const { get, delete: del } = useApi();

async function loadTransformation() {
  // 1. Chargement des transformations
  loading.value = true;
  try {
    transformation.value = await get<Transformation>(
      `/transformations/purchase/${props.purchaseId}`,
    );
    quantityReceived.value = transformation.value.quantity_received;
    quantityUsed.value = transformation.value.total_quantity_used;
    quantityRemaining.value = transformation.value.remaining_quantity;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadTransformation();
});
</script>
