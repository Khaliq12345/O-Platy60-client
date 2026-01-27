<script setup lang="ts">
import type { Category } from '~/types/category'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

const props = defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:dateRange': [start: string | undefined, end: string | undefined]
  'update:category': [value: string | undefined]
  'export': []
}>()

const searchQuery = ref('')
const selectedCategory = ref<string>('all')

const inputDateRef = useTemplateRef('inputDate')

const now = today(getLocalTimeZone())
const startOfYear = new CalendarDate(now.year, 1, 1)

const dateRange = ref<{ start: CalendarDate; end: CalendarDate }>({
  start: startOfYear,
  end: now
})

const defaultPlaceholder = now

const categoryOptions = computed(() => [
  { label: 'Toutes catégories', value: 'all' },
  ...props.categories.map(cat => ({ label: cat.name, value: cat.id }))
])

// Format d'affichage JJ/MM/YYYY
const formattedDateRange = computed(() => {
  const start = dateRange.value.start
  const end = dateRange.value.end
  return `${start.day.toString().padStart(2, '0')}/${start.month.toString().padStart(2, '0')}/${start.year} - ${end.day.toString().padStart(2, '0')}/${end.month.toString().padStart(2, '0')}/${end.year}`
})

watch(dateRange, (newRange) => {
  if (newRange?.start && newRange?.end) {
    emit('update:dateRange', newRange.start.toString(), newRange.end.toString())
  }
}, { immediate: true })

watch(searchQuery, (val) => emit('update:search', val))
watch(selectedCategory, (val) => {
  emit('update:category', val === 'all' ? undefined : val)
})
</script>

<template>
  <UCard class="mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
      <!-- Recherche -->
      <UFormField label="Rechercher">
        <UInput 
          v-model="searchQuery"
          placeholder="Rechercher un article..."
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </UFormField>

      <!-- Date Range Picker -->
      <UFormField label="Période">
        <UInputDate 
          ref="inputDate"
          v-model="dateRange"
          :range="true"
          :default-placeholder="defaultPlaceholder"
          class="w-full"
        >
          <template #trailing>
            <UPopover :reference="inputDateRef?.inputsRef[0]?.$el">
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-heroicons-calendar-days"
                aria-label="Sélectionner une période"
                class="px-0"
              />

              <template #content>
                <UCalendar 
                  v-model="dateRange" 
                  class="p-2" 
                  :number-of-months="2" 
                  range 
                />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </UFormField>

      <!-- Catégorie -->
      <UFormField label="Catégorie">
        <USelect 
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="Toutes catégories"
          class="w-full"
        />
      </UFormField>

      <!-- Export -->
      <div class="h-full flex items-end">
        <UButton 
          color="neutral" 
          variant="outline"
          label="Exporter CSV"
          icon="i-heroicons-arrow-down-tray"
          class="w-full"
          @click="emit('export')"
        />
      </div>
    </div>
  </UCard>
</template>