<!-- pages/products.vue -->
<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Produits" />
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Weekly Product View</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Manage and track stock levels for the current week.</p>
          </div>
          <UButton color="primary" icon="i-lucide-download">Download PDF Report</UButton>
        </div>

        <!-- Week Selector -->
        <div class="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <UButton variant="ghost" color="neutral" icon="i-lucide-chevron-left" @click="prevWeek" />
          <span class="font-medium text-gray-900 dark:text-white">{{ weekLabel }}</span>
          <UButton variant="ghost" color="neutral" icon="i-lucide-chevron-right" @click="nextWeek" />
        </div>

        <!-- Products List -->
        <div class="space-y-4">
          <div v-for="product in products" :key="product.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <!-- Product Header -->
            <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
              <div class="w-1 h-6 bg-primary rounded-full" />
              <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ product.name }}</h3>
              <span class="text-gray-400 dark:text-gray-500 text-sm ml-auto">ID: {{ product.id }}</span>
            </div>

            <!-- Metrics Grid -->
            <div class="p-4">
              <!-- Days Header -->
              <div class="grid grid-cols-8 gap-4 mb-4">
                <div class="text-xs text-gray-400 dark:text-gray-500 uppercase">Metric</div>
                <div v-for="day in weekDays" :key="day" class="text-xs text-gray-400 dark:text-gray-500 uppercase text-center">
                  {{ day }}
                </div>
              </div>

              <!-- Stock Initial -->
              <div class="grid grid-cols-8 gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <div class="text-sm text-gray-600 dark:text-gray-400">Stock Initial</div>
                <div v-for="(val, idx) in product.stockInitial" :key="idx" class="text-center text-sm text-gray-900 dark:text-gray-100">
                  {{ val }}
                </div>
              </div>

              <!-- Entrée -->
              <div class="grid grid-cols-8 gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <div class="text-sm text-gray-600 dark:text-gray-400">Entrée</div>
                <div v-for="(val, idx) in product.entries" :key="idx" class="text-center text-sm text-gray-900 dark:text-gray-100">
                  {{ val || '—' }}
                </div>
              </div>

              <!-- Stock Final -->
              <div class="grid grid-cols-8 gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <div class="text-sm text-gray-600 dark:text-gray-400">Stock Final</div>
                <div v-for="(val, idx) in product.stockFinal" :key="idx" class="text-center text-sm text-gray-900 dark:text-gray-100">
                  {{ val }}
                </div>
              </div>

              <!-- Sortie (Edit) - Row with inputs -->
              <div class="p-2 grid grid-cols-8 gap-4 py-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg mt-2">
                <div class="text-sm text-primary dark:text-primary-400 font-medium flex items-center">Sortie (Edit)</div>
                <div v-for="(_, idx) in product.sales" :key="idx" class="px-1">
                  <UInputNumber 
                    v-model="product.sales[idx]" 
                    :min="0" 
                    size="sm" 
                    class="w-full"
                    color="primary"
                  />
                </div>
              </div>

              <!-- Reste -->
              <div class="grid grid-cols-8 gap-4 py-2 mt-2">
                <div class="text-sm text-gray-600 dark:text-gray-400">Reste</div>
                <div v-for="(val, idx) in product.remaining" :key="idx" class="text-center text-sm font-medium text-primary dark:text-primary-400">
                  {{ val }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { format, addDays, startOfWeek } from 'date-fns'

interface Product {
  id: string
  name: string
  stockInitial: number[]
  entries: number[]
  stockFinal: number[]
  sales: number[]
  remaining: number[]
}

// Données de test
const products = ref<Product[]>([
  {
    id: 'BEV-001',
    name: 'Organic Whole Milk - 1L',
    stockInitial: [120, 110, 105, 135, 120, 115, 95],
    entries: [20, 10, 50, 10, 15, 0, 0],
    stockFinal: [140, 120, 155, 145, 135, 115, 95],
    sales: [30, 15, 20, 25, 20, 20, 15],
    remaining: [110, 105, 135, 120, 115, 95, 80]
  },
  {
    id: 'BEV-002',
    name: 'Almond Milk - Unsweetened 1L',
    stockInitial: [45, 42, 38, 68, 60, 55, 50],
    entries: [10, 0, 40, 0, 10, 0, 0],
    stockFinal: [55, 42, 78, 68, 70, 55, 50],
    sales: [13, 4, 10, 8, 15, 5, 12],
    remaining: [42, 38, 68, 60, 55, 50, 38]
  }
])

// Semaine courante
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart.value, i)
    return format(date, 'EEE dd').toUpperCase()
  })
})

const weekLabel = computed(() => {
  const start = format(currentWeekStart.value, 'MMM dd')
  const end = format(addDays(currentWeekStart.value, 6), 'MMM dd, yyyy')
  return `${start} - ${end}`
})

function prevWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, -7)
}

function nextWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, 7)
}
</script>