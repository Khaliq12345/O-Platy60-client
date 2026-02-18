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
      <TransformationAdd :purchase="purchase" @added="loadTransformation" />
    </div>

    <!-- // Show this is there's transformation -->
    <div v-if="transformation" class="space-y-3">
      <!-- // Show the transformation metrics -->
      <TransformationEdit
        v-if="edit"
        :transformation="transformation"
        :purchase="purchase"
        @edited="loadTransformation"
        @cancel="edit = false"
      />

      <TransformationDetailBody
        v-else
        :transformation="transformation"
        :unit="transformation.unit"
      />

      <!-- // container to add new transformation -->
      <div
        v-if="transformation.remaining_quantity > 0"
        class="mt-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50"
      >
        <h2 class="font-bold">Ajoutez des transformations</h2>
        <TransformationStepAdd
          :transformation="transformation"
          @added="loadTransformation"
        />
      </div>
      <div v-else class="text-primary text-center text-sm">
        Vous ne pouvez plus ajouter de transformation pour ce achat
      </div>

      <TransformationList
        :transformation="transformation"
        :transformation-id="transformation.id"
      />

      <TransformationFooter :transformation="transformation" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PurchaseItem } from "~/types/purchase";
import type { Transformation } from "~/types/transformation";

const props = defineProps<{
  purchase: PurchaseItem;
}>();

//variables to store the transformation
const transformation = ref<Transformation | undefined | null>();

const edit = ref(false);
const loading = ref(true);

// initialise the requests instance
const { get, delete: del } = useApi();

async function loadTransformation() {
  // 1. Chargement des transformations
  loading.value = true;
  edit.value = false;
  transformation.value = null;
  try {
    transformation.value = await get<Transformation>(
      `/transformations/purchase/${props.purchase.id}`,
    );
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
