<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-chevron-left"
        size="xs"
        @click="previousMonth"
      />
      <span class="text-sm font-medium">{{ monthLabel }}</span>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-chevron-right"
        size="xs"
        @click="nextMonth"
      />
    </div>

    <div class="flex justify-center items-center gap-1 overflow-x-auto pb-2">
      <UButton
        v-for="week in weeksData"
        :key="week.number"
        :color="selectedWeek === week.number ? 'primary' : 'neutral'"
        :variant="selectedWeek === week.number ? 'soft' : 'ghost'"
        size="sm"
        class="whitespace-nowrap"
        @click="selectWeek(week)"
      >
        <span class="font-mono text-xs">S{{ week.number }}</span>
        <span class="hidden lg:inline text-xs text-gray-500 ml-2">{{
          week.label
        }}</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isSameMonth,
  format,
  addMonths,
  getWeek,
  startOfISOWeek,
  endOfISOWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

interface Week {
  number: number;
  label: string;
  start_date: string;
  end_date: string;
}

const currentDate = ref(new Date());
const selectedWeek = ref<number | null>(null);
const isInitialized = ref(false); // Guard pour éviter le double appel

const monthLabel = computed(() => {
  return format(currentDate.value, "MMMM yyyy", { locale: fr });
});

const filterData: any = inject("filterInfo");

// ✅ Computed pur, sans side effects
const weeksData = computed((): Week[] => {
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);
  let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  const weeks: Week[] = [];
  let weekNum = 1;

  while (weekStart <= monthEnd) {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const intersectsMonth =
      isSameMonth(weekStart, monthStart) ||
      isSameMonth(weekEnd, monthStart) ||
      (weekStart < monthStart && weekEnd > monthEnd);

    if (intersectsMonth) {
      weeks.push({
        number: weekNum,
        label: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`,
        start_date: format(weekStart, "yyyy-MM-dd"),
        end_date: format(weekEnd, "yyyy-MM-dd"),
      });
      weekNum++;
    }

    weekStart = addWeeks(weekStart, 1);
  }

  return weeks;
});

// Watcher pour gérer l'initialisation et le changement de mois
watch(
  weeksData,
  (newWeeks) => {
    if (newWeeks.length === 0) return;

    // Si c'est la première initialisation, chercher la semaine actuelle
    if (!isInitialized.value) {
      const today = new Date();
      const currentWeek = newWeeks.find((week) => {
        const start = new Date(week.start_date);
        const end = new Date(week.end_date);
        return today >= start && today <= end;
      });

      if (currentWeek) {
        selectWeek(currentWeek);
      } else {
        // Si on est pas dans le mois affiché, prendre la première semaine
        selectWeek(newWeeks[0]);
      }
      isInitialized.value = true;
    } 
    // Si on change de mois et qu'aucune semaine n'est sélectionnée pour ce mois
    else if (!newWeeks.find(w => w.number === selectedWeek.value)) {
      selectWeek(newWeeks[0]);
    }
  },
  { immediate: true }
);

function previousMonth() {
  currentDate.value = addMonths(currentDate.value, -1);
  // Reset selectedWeek pour forcer la sélection d'une semaine du nouveau mois
  selectedWeek.value = null;
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
  // Reset selectedWeek pour forcer la sélection d'une semaine du nouveau mois
  selectedWeek.value = null;
}

function selectWeek(week: Week) {
  selectedWeek.value = week.number;
  filterData.number = week.number;
  filterData.start_date = week.start_date;
  filterData.end_date = week.end_date;
}
</script>