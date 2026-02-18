<template>
  <div class="grid grid-cols-1 lg:grid-cols-[repeat(3,1fr)_auto] gap-4 items-end w-full p-5">
    <!-- Recherche -->
    <UFormField label="Rechercher" class="lg:col-span-1">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un article..."
        icon="i-heroicons-magnifying-glass"
        class="w-full"
      />
    </UFormField>

    <!-- Période - BIDIRECTIONNEL avec defineModel -->
    <UFormField label="Période" class="lg:col-span-1">
      <UInputDate
        v-model="dateRange"
        :range="true"
        class="w-full"
      />
    </UFormField>

    <!-- Catégorie -->
    <UFormField label="Catégorie" class="lg:col-span-1">
      <USelect
        v-model="selectedCategory"
        :items="categoryOptions"
        placeholder="Toutes"
        class="w-full"
      />
    </UFormField>

    <!-- Export -->
    <div class="pb-px">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-down-tray"
        @click="emit('export')"
        title="Exporter CSV"
        class="w-full lg:w-auto flex justify-center"
      >
        <span class="lg:hidden">Exporter CSV</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/types/category";
import type { CalendarDate } from "@internationalized/date";

// Injection des catégories depuis List.vue
const categories = inject<Ref<Category[]>>("categories", ref([]));

// V-MODELS (Vue 3.4 defineModel) - Pas de watch nécessaire !
const searchQuery = defineModel<string>("searchQuery", { default: "" });
const selectedCategory = defineModel<string | undefined>("category");
const dateRange = defineModel<{ start: CalendarDate; end: CalendarDate }>("dateRange", {
  required: true
});

// Événements simples
const emit = defineEmits<{
  export: [];
}>();

// Options catégories - undefined représente "Toutes"
const categoryOptions = computed(() => [
  { label: "Toutes catégories", value: undefined },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);
</script>