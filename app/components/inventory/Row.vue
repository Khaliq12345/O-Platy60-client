<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
    
    <!-- DESKTOP : Version carte -->
    <div class="hidden lg:block">
      <!-- Header avec nom et bouton -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ item.name }}</h3>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="isOpen = !isOpen"
        />
      </div>

      <!-- Grille des 7 jours -->
      <div class="p-4 grid grid-cols-7 gap-4">
        <div 
          v-for="(day, index) in days" 
          :key="index"
          class="text-center"
        >
          <div class="text-xs font-medium text-gray-500 uppercase mb-2">
            {{ shortDays[index] }}
          </div>
          
          <div class="space-y-2">
            <!-- Entrées -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
              <div class="text-[10px] text-gray-400 uppercase mb-1">Entrées</div>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ day?.entries ?? '—' }}</p>
            </div>
            
            <!-- Ventes -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
              <div class="text-[10px] text-gray-400 uppercase mb-1">Ventes</div>
              <UInputNumber 
                v-model="day.sales" 
                :min="0" 
                size="sm" 
                placeholder="—"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE : Jours empilés (inchangé) -->
    <div class="lg:hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="isOpen = !isOpen"
        />
      </div>

      <div class="p-4 space-y-3">
        <div 
          v-for="(day, index) in visibleDays" 
          :key="index"
          class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
        >
          <div class="font-medium text-gray-600 dark:text-gray-400 w-20">
            {{ weekDays[index] }}
          </div>
          <div class="flex items-center gap-4">
            <div class="text-center">
              <span class="text-[10px] uppercase text-gray-400 font-medium block">Entrées</span>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ day?.entries ?? '—' }}</p>
            </div>
            <div class="text-center">
              <span class="text-[10px] uppercase text-gray-400 font-medium block">Ventes</span>
              <UInputNumber 
                v-model="day.sales" 
                :min="0" 
                size="sm" 
                placeholder="—"
                class="w-16"
              />
            </div>
          </div>
        </div>
        
        <UButton
          v-if="!showAllDays && days.length > 3"
          variant="link"
          size="sm"
          color="primary"
          block
          @click="showAllDays = true"
        >
          Voir les 4 autres jours
        </UButton>

        <template v-if="showAllDays">
          <div 
            v-for="(day, index) in hiddenDays" 
            :key="index + 3"
            class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
          >
            <div class="font-medium text-gray-600 dark:text-gray-400 w-20">
              {{ weekDays[index + 3] }}
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <span class="text-[10px] uppercase text-gray-400 font-medium block">Entrées</span>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ day?.entries ?? '—' }}</p>
              </div>
              <div class="text-center">
                <span class="text-[10px] uppercase text-gray-400 font-medium block">Ventes</span>
                <UInputNumber 
                  v-model="day.sales" 
                  :min="0" 
                  size="sm" 
                  placeholder="—"
                  class="w-16"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Accordion détails (commun) -->
    <UCollapsible v-model:open="isOpen">
      <template #content>
        <div class="px-4 pb-4 pt-2 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
              <div class="text-xs text-gray-500 uppercase mb-1">Total ventes</div>
              <div class="text-2xl font-semibold text-rose-500">—</div>
            </div>

            <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
              <div class="text-xs text-gray-500 uppercase mb-1">Stock final</div>
              <div class="text-2xl font-semibold text-primary">—</div>
            </div>

            <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
              <div class="text-xs text-gray-500 uppercase mb-1">Inventaire</div>
              <UInputNumber :min="0" size="lg" class="w-24 mx-auto" color="primary" />
            </div>

            <div class="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
              <div class="text-xs text-gray-500 uppercase mb-1">Écart</div>
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">—</div>
            </div>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

<script setup lang="ts">
import type { Inventory } from "~/types/inventory";

interface DayValue {
  entries: number | null;
  sales: number | null;
}

interface Props {
  item: Inventory;
  days?: DayValue[];
}

const props = withDefaults(defineProps<Props>(), {
  days: () => Array(7).fill(null).map(() => ({ entries: null, sales: null })),
});

const isOpen = ref(false);
const showAllDays = ref(false);

const shortDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const visibleDays = computed(() => props.days.slice(0, 3));
const hiddenDays = computed(() => props.days.slice(3));
</script>