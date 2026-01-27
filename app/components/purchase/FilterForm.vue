<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-[repeat(5,1fr)_auto] gap-4 items-end w-full p-5"
  >
    <UFormField label="Rechercher" class="lg:col-span-3">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un article..."
        icon="i-heroicons-magnifying-glass"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Période" class="lg:col-span-1">
      <UInputDate
        ref="inputDate"
        v-model="dateRange"
        :range="true"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Catégorie" class="lg:col-span-1">
      <USelect
        v-model="selectedCategory"
        :items="categoryOptions"
        placeholder="Toutes"
        class="w-full"
      />
    </UFormField>

    <div class="pb-[1px]">
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
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const emit = defineEmits<{
  "update:search": [value: string];
  "update:dateRange": [start: string | undefined, end: string | undefined];
  "update:category": [value: string | undefined];
  export: [];
}>();

//Props
const searchQuery = defineModel("searchQuery");

// Inject
const categories = inject<Ref<Category[]>>("categories", ref([]));

const selectedCategory = ref<string>("all");

const inputDateRef = useTemplateRef("inputDate");

const now = today(getLocalTimeZone());
const startOfYear = new CalendarDate(now.year, 1, 1);

const dateRange = ref<{ start: CalendarDate; end: CalendarDate }>({
  start: startOfYear,
  end: now,
});

const defaultPlaceholder = now;

const categoryOptions = computed(() => [
  { label: "Toutes catégories", value: "all" },
  ...categories.value.map((cat) => ({ label: cat.name, value: cat.id })),
]);

// Format d'affichage JJ/MM/YYYY
const formattedDateRange = computed(() => {
  const start = dateRange.value.start;
  const end = dateRange.value.end;
  return `${start.day.toString().padStart(2, "0")}/${start.month.toString().padStart(2, "0")}/${start.year} - ${end.day.toString().padStart(2, "0")}/${end.month.toString().padStart(2, "0")}/${end.year}`;
});

watch(
  dateRange,
  (newRange) => {
    if (newRange?.start && newRange?.end) {
      emit(
        "update:dateRange",
        newRange.start.toString(),
        newRange.end.toString(),
      );
    }
  },
  { immediate: true },
);

watch(searchQuery, (val) => emit("update:search", val));
watch(selectedCategory, (val) => {
  emit("update:category", val === "all" ? undefined : val);
});
</script>
