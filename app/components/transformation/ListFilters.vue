<template>
  <!-- Desktop: Layout horizontal -->
  <div class="hidden sm:flex px-4 flex-row gap-3">
    <UInput
      v-model="searchQuery"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher..."
      class="grow h-full"
    />

    <UInputDate v-model="dateRange" range>
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

    <UButton icon="i-heroicons-funnel" @click="sendFilter" />
  </div>

  <!-- Mobile: Input visible + bouton pour ouvrir les filtres -->
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
  </div>

  <!-- Mobile: Bottom Drawer avec uniquement les filtres avancés -->
  <UDrawer v-model:open="isOpen" direction="bottom">
    <template #content>
      <div class="p-4 space-y-4">
        <div
          class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800"
        >
          <h3 class="text-lg font-semibold">Filtres avancés</h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-funnel"
            @click="isOpen = false"
          />
        </div>

        <div class="space-y-4">
          <UInputDate v-model="dateRange" range class="w-full">
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
            icon="i-lucide-funnel"
            label="Appliquer les filtres"
            class="w-full"
            @click="handleMobileFilter"
          />
        </div>

      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const isOpen = ref(false);
const emit = defineEmits(["filter"]);
const searchQuery = ref<string>("");
const now = today(getLocalTimeZone());
const dateRange = shallowRef({
  start: new CalendarDate(now.year, 1, 1),
  end: now.add({ years: 1 }),
});

const inputDate = useTemplateRef("inputDate");

const handleMobileFilter = () => {
  sendFilter();
  isOpen.value = false;
};

function sendFilter() {
  emit("filter", {
    search: searchQuery.value,
    date: {
      start: dateRange.value.start,
      end: dateRange.value.end,
    },
  });
}
</script>
