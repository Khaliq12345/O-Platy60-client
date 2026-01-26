<script setup lang="ts">
import type { Category } from "~/types/category"
import type { PurchaseItem } from "~/types/purchase"

const props = defineProps<{
  item: PurchaseItem
  categories: Category[]
}>()

const emit = defineEmits<{
  'view': [item: PurchaseItem]
  'edit': [item: PurchaseItem]
  'delete': [item: PurchaseItem]
}>()

const { generateBadgeColor, generateColor } = useColorGenerator()

const category = computed(() => 
  props.categories.find(cat => cat.id === props.item.category_id)
)

// Génère la couleur dynamiquement à partir du nom de la catégorie
const categoryColor = computed(() => {
  const name = category.value?.name || 'default'
  return generateBadgeColor(name)
})

// Option: style inline pour plus de précision HSL
const categoryStyle = computed(() => {
  const name = category.value?.name || 'default'
  const { hsl } = generateColor(name, {
    saturation: 60,
    lightness: 20
  })
  return {
    backgroundColor: hsl,
    color: 'white'
  }
})
</script>

<template>
  <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
    <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">
      {{ new Date(item.purchase_date).toLocaleDateString('fr-FR') }}
    </td>
    <td class="py-3 px-4">
      <div class="font-medium text-gray-900 dark:text-white">
        {{ item.item_name }}
      </div>
    </td>
    <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">
      {{ item.quantity }}
    </td>
    <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">
      {{ item.price_per_unit.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}
    </td>
    <td class="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
      {{ item.total_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}
    </td>
    <td class="py-3 px-4">
      <!-- Version avec couleur Tailwind (UBadge) -->
      <!-- <UBadge 
        class="categoryColor" 
        variant="subtle"
        class="rounded-full"
      >
        {{ category?.name || 'Sans catégorie' }}
      </UBadge> -->
      
      <!-- Alternative: style inline pour couleur exacte HSL -->
      
      <span 
        class="px-2 py-1 rounded-full text-xs font-medium"
        :style="categoryStyle"
      >
        {{ category?.name || 'Sans catégorie' }}
      </span>
     
    </td>
    <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">
      {{ item.quantity }} {{ item.unit }}
    </td>
    <td class="py-3 px-4">
      <div class="flex gap-2">
        <UButton 
          color="neutral" 
          variant="ghost" 
          icon="i-heroicons-eye"
          size="xs"
          @click="emit('view', item)"
        />
        <UButton 
          color="neutral" 
          variant="ghost" 
          icon="i-heroicons-pencil"
          size="xs"
          @click="emit('edit', item)"
        />
        <UButton 
          color="error" 
          variant="ghost" 
          icon="i-heroicons-trash"
          size="xs"
          @click="emit('delete', item)"
        />
      </div>
    </td>
  </tr>
</template>