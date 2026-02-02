<template>
  <div class="hidden md:flex items-center px-4 gap-3 w-full">
    <UInput
      v-model="searchQuery"
      name="Search"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher..."
      class="grow"
    />

    <div class="flex flex-row gap-3 items-center">
      <slot name="filters" />
    </div>

    <UInputDate ref="inputDate" v-model="dateRange" range>
      <template #trailing>
        <UPopover :reference="inputDate?.inputsRef?.[0]?.$el">
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-calendar"
            aria-label="Select a date range"
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

    <UButton icon="i-heroicons-funnel" @click="reloadPurchase()" />

    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>

  <!-- Mobile: Input visible + bouton drawer -->
  <div class="md:hidden px-4 flex flex-row gap-2">
    <UInput
      v-model="searchQuery"
      name="Search"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher..."
      class="grow"
    />

    <UButton
      icon="i-heroicons-funnel"
      color="neutral"
      variant="outline"
      @click="isOpen = true"
    />

    <slot name="mobile-actions" />
  </div>

  <!-- Mobile: Bottom Drawer avec filtres additionnels -->
  <UDrawer
    v-model:open="isOpen"
    direction="bottom"
    title="Filtres"
    ,
    description="Tous les filtres"
  >
    <template #content>
      <div class="p-4 space-y-4">
        <div
          class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800"
        >
          <UButton
            label="Filtres"
            color="neutral"
            variant="ghost"
            icon="i-lucide-menu"
            @click="isOpen = false"
          />
        </div>

        <div class="space-y-4 flex flex-col">
          <UInput
            name="Search"
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher..."
            class="grow"
          />
          <!-- Slot filtres dans le drawer (mobile uniquement) -->
          <div class="gap-2 flex flex-row items-center">
            <slot name="filters" />
            <UInputDate
              ref="inputDate"
              v-model="dateRange"
              range
              class="w-full"
            >
              <template #trailing>
                <UPopover :reference="inputDate?.inputsRef[0]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="Select a date range"
                    class="px-0"
                  />
                  <template #content>
                    <UCalendar
                      v-model="dateRange"
                      class="p-2"
                      :number-of-months="1"
                      range
                    />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
          </div>

          <UButton
            icon="i-heroicons-funnel"
            label="Appliquer"
            class="w-full"
            @click="reloadPurchase()"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const emit = defineEmits<{
  filter: [];
}>();

// Connect the enter keyboard in to the component
defineShortcuts({
  enter: {
    usingInput: "Search",
    handler: () => reloadPurchase(),
  },
});

const searchQuery = defineModel("searchQuery");
const dateUpdated = defineModel("dateRange");

const isOpen = ref(false);
const now = today(getLocalTimeZone());

const inputDate = useTemplateRef("inputDate");
const dateRange = shallowRef({
  start: new CalendarDate(now.year, 1, 1),
  end: now.add({ years: 1 }),
});

const reloadPurchase = () => {
  console.log("RELOADING!!");
  // Update daterange filter
  dateUpdated.value = {
    start: dateRange.value?.start.toString(),
    end: dateRange.value?.end.toString(),
  };
  emit("filter");
};
</script>
