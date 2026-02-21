<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Tableau de bord" />
    </template>

    <template #body>
      <div class="lg:p-6 lg:space-y-6 space-y-4">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatCard
            v-for="stat in stats"
            :key="stat.title"
            v-bind="stat"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Dépenses Chart -->
          <UCard>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Dépenses d'Achats</h3>
              <USelect v-model="period" :items="periods" size="sm" />
            </div>
            <BarChart
              :data="expenseData"
              :height="250"
              :categories="{ amount: { name: 'Montant', color: '#3b82f6' } }"
              :y-axis="['amount']"
              x-axis="label"
              :y-formatter="(v: number) => `${(v / 1000).toFixed(0)}k`"
              :radius="4"
            />
          </UCard>

          <!-- Rendement par catégorie -->
          <UCard>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Rendement par Catégorie</h3>
              <UButton color="neutral" variant="ghost" icon="i-lucide-more-horizontal" />
            </div>
            <DashboardProgressList :items="yieldData" />
          </UCard>
        </div>

        <!-- Activités récentes -->
        <UCard>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Activités Récentes</h3>
            <UButton color="primary" variant="link" label="Voir tout" />
          </div>
          <DashboardActivityList :activities="activities" />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
// Données temporaires
const period = ref('monthly')
const periods = [
  { label: '7 jours', value: 'weekly' },
  { label: '30 jours', value: 'monthly' },
  { label: 'Année', value: 'yearly' }
]

const stats = [
  {
    title: 'Achats du mois',
    value: '1.25M',
    unit: 'FCFA',
    icon: 'i-lucide-credit-card',
    trend: '+5%',
    trendUp: true,
    color: 'blue'
  },
  {
    title: 'Transformations',
    value: '12',
    icon: 'i-lucide-utensils',
    color: 'purple'
  },
  {
    title: 'Rendement',
    value: '88%',
    icon: 'i-lucide-trending-up',
    trend: '+0.5%',
    trendUp: true,
    color: 'green'
  },
  {
    title: 'Alertes',
    value: '4',
    subtitle: 'articles bas',
    icon: 'i-lucide-alert-triangle',
    alert: true,
    color: 'red'
  }
]

const expenseData = [
  { label: 'Lun', amount: 250000 },
  { label: 'Mar', amount: 450000 },
  { label: 'Mer', amount: 380000 },
  { label: 'Jeu', amount: 520000 },
  { label: 'Ven', amount: 680000 },
  { label: 'Sam', amount: 750000 },
  { label: 'Dim', amount: 420000 }
]

const yieldData = [
  { label: 'Viande', value: 82, suffix: '%' },
  { label: 'Légumes', value: 94, suffix: '%' },
  { label: 'Épicerie', value: 98, suffix: '%' }
]

const activities = [
  { id: 1, type: 'Achat', item: 'Pommes de Terre (50kg)', value: '25,000 FCFA', status: 'Complété', date: '14:20', icon: 'i-lucide-shopping-bag', color: 'blue' },
  { id: 2, type: 'Transformation', item: 'Frites de patate', value: '30 portions', status: 'En cours', date: '13:15', icon: 'i-lucide-utensils', color: 'purple' },
  { id: 3, type: 'Stock', item: 'Huile végétale', value: 'Alerte', status: 'Action requise', date: '11:30', icon: 'i-lucide-alert-triangle', color: 'red' }
]
</script>