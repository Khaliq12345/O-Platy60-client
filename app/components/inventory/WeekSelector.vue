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
        <span class="hidden lg:inline text-xs text-gray-500 ml-2">{{ week.start }} - {{ week.end }}</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Week {
  number: number;
  start: string;
  end: string;
  start_date: string;
  end_date: string;
}

const emit = defineEmits<{
  select: [week: { number: number; start_date: string; end_date: string }];
}>();

const currentDate = ref(new Date());
const selectedWeek = ref<number | null>(null);

const monthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });
});

const weeks = computed((): Week[] => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const weeks: Week[] = [];
  let current = new Date(firstDay);
  
  while (current.getDay() !== 1) {
    current.setDate(current.getDate() - 1);
  }
  
  let weekNum = 1;
  
  while (current <= lastDay || current.getMonth() === month) {
    const start = new Date(current);
    const end = new Date(current);
    end.setDate(end.getDate() + 6);
    
    if (end >= firstDay && start <= lastDay) {
      weeks.push({
        number: weekNum,
        start: formatDate(start),
        end: formatDate(end),
        start_date: formatDateISO(start),
        end_date: formatDateISO(end)
      });
      weekNum++;
    }
    
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
});

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit'
  });
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
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
    return today >= start && today <= end;
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
