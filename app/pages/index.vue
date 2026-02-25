<template>
  <!-- Header -->
  <UHeader>
    <template #title>
      <h1 class="text-3xl font-bold tracking-tight">O-Platy60</h1>
    </template>

    <template #right>
      <UButton label="Connexion" to="/login" variant="ghost" />
      <UButton label="Essai gratuit" />
    </template>
  </UHeader>

  <div class="w-full space-y-28 max-w-3/4 mx-auto">
    <!-- CTA 1 - Hero Section -->
    <UPageSection
      title="Maîtrisez vos coûts de la réception à l'assiette"
      description="Suivez vos achats en temps réel, optimisez vos rendements de transformations et réduisez le gaspillage alimentaire avec la plateforme de gestion la plus intuitive du marché."
      orientation="horizontal"
      :links="links"
      class="mb-0"
    >
      <img
        src="https://picsum.photos/704/1294"
        width="352"
        height="647"
        alt="Illustration"
        class="rounded-lg shadow-2xl mx-auto"
      />
    </UPageSection>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(grid, index) in grids"
        :key="index"
        class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700"
      >
        <div class="text-3xl font-bold text-primary mb-1">{{ grid.title }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ grid.description }}
        </div>
      </div>
    </div>

    <!-- Functionality Section -->
    <div>
      <div class="text-center mb-10">
        <h2 class="text-2xl font-semibold mb-3 text-primary">
          Fonctionnalités
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Tout ce dont vous avez besoin pour piloter votre cuisine avec
          efficacité et précision
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UPageCard
          v-for="(card, index) in cards"
          :key="index"
          v-bind="card"
          class="hover:shadow-lg transition-shadow duration-300"
        />
      </div>
    </div>

    <!-- CTA 2 -->
    <UPageCTA
      title="Prêt à transformer la gestion de votre cuisine ?"
      description="Rejoignez les chefs et gestionnaires qui ont choisi l'efficacité"
      :links="[
        {
          label: 'Commencer mon essai gratuit de 14 jours',
          color: 'primary',
          size: 'lg',
        },
        {
          label: 'Aucune carte de crédit requise',
          size: 'sm',
          color: 'neutral',
          variant: 'link',
        },
      ]"
      class="text-center"
    />

    <!-- Footer -->
    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          O-Platy60 © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <p class="text-muted text-sm">
          Fièrement développé par les passionnés de gastronomie.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
import type { ButtonProps } from "@nuxt/ui";

const links = ref<ButtonProps[]>([
  {
    label: "Démarrer maintenant",
    to: "/login",
    color: "primary",
    size: "lg",
  },
  {
    label: "Voir la démo",
    color: "neutral",
    variant: "subtle",
    size: "lg",
  },
]);

const grids = [
  { title: "150+", description: "Restaurants actifs" },
  { title: "15%", description: "Économies moyennes" },
  { title: "24/7", description: "Support réactif" },
  { title: "10k+", description: "Articles gérés" },
];

const cards = ref([
  {
    title: "Gestion des achats",
    description:
      "Centralisez chaque facture et article. Suivez l'évolution des prix et de vos fournisseurs en un clin d'œil pour protéger vos marges.",
    icon: "i-lucide-shopping-cart",
  },
  {
    title: "Suivi des transformations",
    description:
      "Calculez précisément vos taux de rendement. Identifiez les pertes lors de la préparation pour optimiser l'utilisation de vos matières premières.",
    icon: "i-lucide-scale",
  },
  {
    title: "Alertes de stock",
    description:
      "Ne soyez plus jamais en rupture. Recevez des notifications intelligentes quand vos ingrédients atteignent un seuil critique.",
    icon: "i-lucide-bell-ring",
  },
]);
</script>
