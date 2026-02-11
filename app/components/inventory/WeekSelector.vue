<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-left" size="xs" @click="previousMonth" />
      <span class="text-sm font-medium">{{ monthLabel }}</span>
      <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-right" size="xs" @click="nextMonth" />
    </div>

    <div class="flex justify-center items-center gap-1 overflow-x-auto pb-2">
      <UButton
        v-for="week in weeks"
        :key="week.number"
        :color="selectedWeek === week.number ? 'primary' : 'neutral'"
        :variant="selectedWeek === week.number ? 'soft' : 'ghost'"
        size="sm"
        class="whitespace-nowrap"
        @click="selectWeek(week)"
      >
        <span class="font-mono text-xs">S{{ week.number }}</span>
        <span class="hidden lg:inline text-xs text-gray-500 ml-2">{{ week.label }}</span>
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
  isWithinInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface Week {
  number: number;
  label: string;
  start_date: string;
  end_date: string;
}

const emit = defineEmits<{
  select: [week: { number: number; start_date: string; end_date: string }];
}>();

const currentDate = ref(new Date());
const selectedWeek = ref<number | null>(null);

const monthLabel = computed(() => {
  return format(currentDate.value, 'MMMM yyyy', { locale: fr });
});

const weeks = computed((): Week[] => {
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);
  
  // Premier lundi du mois (ou avant)
  let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  const weeks: Week[] = [];
  let weekNum = 1;
  
  while (weekStart <= monthEnd) {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    // Garder si la semaine intersecte le mois
    const intersectsMonth = isSameMonth(weekStart, monthStart) || 
                           isSameMonth(weekEnd, monthStart) ||
                           (weekStart < monthStart && weekEnd > monthEnd);
    
    if (intersectsMonth) {
      weeks.push({
        number: weekNum,
        label: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(weekEnd, 'yyyy-MM-dd')
      });
      weekNum++;
    }
    
    weekStart = addWeeks(weekStart, 1);
  }
  
  return weeks;
});

function previousMonth() {
  currentDate.value = addMonths(currentDate.value, -1);
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
}

function selectWeek(week: Week) {
  selectedWeek.value = week.number;
  emit('select', {
    number: week.number,
    start_date: week.start_date,
    end_date: week.end_date
  });
}

onMounted(() => {
  const today = new Date();
  const currentWeek = weeks.value.find(w => {
    const start = new Date(w.start_date);
    const end = new Date(w.end_date);
    return isWithinInterval(today, { start, end });
  });
  
  if (currentWeek) {
    selectedWeek.value = currentWeek.number;
    emit('select', {
      number: currentWeek.number,
      start_date: currentWeek.start_date,
      end_date: currentWeek.end_date
    });
  }
});
</script>