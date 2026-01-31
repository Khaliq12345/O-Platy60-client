<template>
  <!-- Desktop: Layout horizontal -->
  <div class="hidden sm:flex px-4 flex-row gap-3 items-center">
    <UInput
      v-model="searchQuery"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher..."
      class="grow h-full"
    />

    <!-- Slot filtres additionnels - visible sur desktop -->
    <div class="flex flex-row gap-3 items-center">
      <slot name="filters" />
    </div>

    <UInputDate ref="inputDate" v-model="dateRange" range>
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
              :number-of-months="2"
              range
            />
          </template>
        </UPopover>
      </template>
    </UInputDate>

    <UButton
      icon="i-heroicons-funnel"
      @click="
        () => {
          updateDate;
          emit('filter');
        }
      "
    />

    <!-- Slot actions - desktop only -->
    <slot name="actions" />
  </div>

  <!-- Mobile: Input visible + bouton drawer -->
  <div class="sm:hidden px-4 flex flex-row gap-2">
    <UInput
      v-model="searchQuery"
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
  <UDrawer v-model:open="isOpen" direction="bottom">
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

        <div class="space-y-4">
          <!-- Slot filtres dans le drawer (mobile uniquement) -->
          <div class="space-y-3">
            <slot name="filters" />
          </div>

          <UInputDate ref="inputDate" v-model="dateRange" range class="w-full">
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

          <UButton
            icon="i-heroicons-funnel"
            label="Appliquer"
            class="w-full"
            @click="emit('filter')"
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

const searchQuery = defineModel("searchQuery");
const dateUpdated = defineModel("dateRange");

const isOpen = ref(false);
const now = today(getLocalTimeZone());

const inputDate = useTemplateRef("inputDate");
const dateRange = shallowRef({
  start: new CalendarDate(now.year, 1, 1),
  end: now.add({ years: 1 }),
});
// Update daterange filter
const updateDate = computed(() => {
  dateUpdated.value = {
    start: dateRange.value?.start.toString(),
    end: dateRange.value?.end.toString(),
  };
});
</script>
