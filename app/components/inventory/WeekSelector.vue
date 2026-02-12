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
  isWithinInterval,
  addMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

interface Week {
  number: number;
  label: string;
  start_date: string;
  end_date: string;
}

// Reactive variable to hold the data
const currentDate = ref(new Date());
const selectedWeek = ref<number | null>(null);
const monthLabel = computed(() => {
  return format(currentDate.value, "MMMM yyyy", { locale: fr });
});
const filterData: any = inject("filterInfo");

// Calculate all the weeks for a month and loading the inventories
const weeksData = computed((): Week[] => {
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);

  // Premier lundi du mois (ou avant)
  let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  const weeks: Week[] = [];
  let weekNum = 1;

  while (weekStart <= monthEnd) {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    // Garder si la semaine intersecte le mois
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

  if (weeks.length > 0) {
    filterData.number = weeks[0].number;
    filterData.start_date = weeks[0].start_date;
    filterData.end_date = weeks[0].end_date;
  }
  return weeks;
});

// Update current date
function previousMonth() {
  currentDate.value = addMonths(currentDate.value, -1);
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
}

// Function to run when the week is selected
function selectWeek(week: Week) {
  selectedWeek.value = week.number;
  filterData.number = week.number;
  filterData.start_date = week.start_date;
  filterData.end_date = week.end_date;
}
</script>
