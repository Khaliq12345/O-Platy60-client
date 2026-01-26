<script setup lang="ts">
import type { Category } from '~/types/category'
import type { PurchaseItem } from '~/types/purchase'

const { get } = useApi()

const purchases = ref<PurchaseItem[]>([])
const categories = ref<Category[]>([])

// Filtres
const searchQuery = ref('')
const selectedCategory = ref<string | undefined>(undefined)
const startDate = ref<string | undefined>(undefined)
const endDate = ref<string | undefined>(undefined)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalPages = ref(1)

async function loadCategories() {
  categories.value = await get<Category[]>('/categories')
}

async function loadPurchases() {
  const query: Record<string, any> = {
    page: currentPage.value,
    limit: itemsPerPage.value
  }
  
  if (selectedCategory.value) {
    query.category_id = selectedCategory.value
  }
  
  if (startDate.value) {
    query.start_date = startDate.value  // Format: 2026-01-26
  }
  
  if (endDate.value) {
    query.end_date = endDate.value      // Format: 2026-01-26
  }
  
  const response = await get<PurchaseItem[]>('/purchases', query)
  purchases.value = response
}

onMounted(() => {
  loadCategories()
  loadPurchases()
})

// Gestion de la plage de dates
function handleDateRange(start: string | undefined, end: string | undefined) {
  startDate.value = start
  endDate.value = end
  loadPurchases()
}

// Actions
function handleNewPurchase() {
  // Ouvrir drawer de création
}

function handleView(item: PurchaseItem) {
  console.log('View', item)
}

function handleEdit(item: PurchaseItem) {
  console.log('Edit', item)
}

function handleDelete(item: PurchaseItem) {
  console.log('Delete', item)
}

function handleExport() {
  console.log('Export CSV')
}
</script>

<template>
  <div class="p-4 mx-auto">
    <PurchaseListHeader @new-purchase="handleNewPurchase" />
    
    <PurchaseListFilters 
      :categories="categories"
      @update:search="searchQuery = $event"
      @update:category="selectedCategory = $event; loadPurchases()"
      @update:date-range="handleDateRange"
      @export="handleExport"
    />
    
    <PurchaseListTable 
      :purchases="purchases"
      :categories="categories"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    
    <PurchaseListPagination 
      v-model:current-page="currentPage"
      v-model:items-per-page="itemsPerPage"
      :total-pages="totalPages"
      @update:current-page="loadPurchases()"
      @update:items-per-page="loadPurchases()"
    />
  </div>
</template>