<template>
  <div
    class="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800"
  >
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-chevron-left"
      @click="prevWeek"
    />
    <span class="font-medium text-gray-900 dark:text-white">{{ weekLabel }}</span>
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-chevron-right"
      @click="nextWeek"
    />
  </div>
</template>

<script setup lang="ts">
import { addDays, format, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";

const weekStart = inject<Ref<Date>>("weekStart");
if (!weekStart) {
  throw new Error("weekStart not provided");
}

const weekLabel = computed(() => {
  const start = format(weekStart.value, "dd MMM", { locale: fr });
  const end = format(addDays(weekStart.value, 6), "dd MMM yyyy", {
    locale: fr,
  });
  return `${start} - ${end}`;
});

function prevWeek() {
  weekStart.value = addWeeks(weekStart.value, -1);
}

function nextWeek() {
  weekStart.value = addWeeks(weekStart.value, 1);
}
</script>