<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Inventaires" />
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <InventoryHeader />
        <InventoryAdd />

        <Loading v-if="loading" />

        <template v-else>
          <div class="space-y-4">
            <InventoryRow
              v-for="(item, index) in inventoryItems"
              :key="item.inventory_id"
              :item="item"
              :days="weeklyData[index]"
            />
          </div>

          <div v-if="inventoryItems.length === 0" class="text-center py-12 text-gray-500">
            Aucun inventaire trouvé
          </div>

          <LimitPagination
            :page="query.page"
            :limit="query.limit"
            :total="query.total"
            @change-page="(val: number) => { query.page = val; loadInventoryData(); }"
            @change-limit="(val: any) => { query.limit = val.limit; query.page = val.page; loadInventoryData(); }"
          />
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Inventory, InventoriesResponse } from "~/types/inventory";

interface DayValue {
  entries: number | null;
  sales: number | null;
}

const { get } = useApi();
const toast = useToast();

const inventoryItems = ref<Inventory[]>([]);
const weeklyData = ref<DayValue[][]>([]);
const loading = ref(true);

const query = ref({
  page: 1,
  limit: 5, // Moins de produits par page pour plus d'espace
  total: 0,
});

const emptyDay = (): DayValue => ({ entries: null, sales: null });
const emptyWeek = (): DayValue[] => Array(7).fill(null).map(emptyDay);

async function loadInventoryData() {
  loading.value = true;
  try {
    const response = await get<InventoriesResponse>("/inventories", query.value);
    const items = response?.inventories ?? [];
    inventoryItems.value = items;
    weeklyData.value = items.map(() => emptyWeek());
    query.value.total = response?.count ?? 0;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les inventaires",
      color: "error",
    });
    inventoryItems.value = [];
    weeklyData.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadInventoryData();
});
</script>