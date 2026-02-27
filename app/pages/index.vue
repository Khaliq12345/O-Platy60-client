<template>
  <!-- Header -->
  <UHeader>
    <template #title>
      <h1 class="text-3xl font-bold tracking-tight">O-Platy60</h1>
    </template>

    <UNavigationMenu :items="items" />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>

    <template #right>
      <UButton label="Connexion" to="/login" variant="ghost" />
      <UButton label="Essai gratuit" />
    </template>
  </UHeader>

  <div class="w-full space-y-28 px-4">
    <!-- CTA 1 - Hero Section -->
    <UPageSection
      title="Maîtrisez vos coûts de la réception à l'assiette"
      description="Suivez vos achats en temps réel..."
      orientation="horizontal"
      :links="links"
      class=""
      :ui="{
        root: '', // root cause of issues
        container: '',
        description: 'text-muted dark:text-white',
      }"
    >
      <img
        src="https://picsum.photos/1294/704"
        width="647"
        height="352"
        alt="Illustration"
        class="ms-auto w-full rounded-lg shadow-2xl"
      />
      <div class="flex gap-2 items-center">
        <UAvatarGroup :max="1">
          <UAvatar text="+25" />
        </UAvatarGroup>
        <p>Nous font confiance</p>
      </div>
    </UPageSection>

    <!-- Stats Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-primary rounded-lg p-2 text-white"
    >
      <div v-for="(grid, index) in grids" :key="index" class="p-6 text-center">
        <div class="text-3xl font-bold mb-1">{{ grid.title }}</div>
        <div class="text-sm">
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

    <!-- Pricing -->
    <UPageSection
      title="Essayez notre offre maintenant"
      orientation="horizontal"
      :links="[{ label: 'Demander un essai' }]"
    >
      <UPricingPlan
        title="Solo"
        description="Pour un essai rapide."
        price="$000"
        discount="$000"
        class="bg-primary"
        :features="[
          'Accès au mode groupe.',
          'Accès à toutes les fonctionnalités de bases.',
          'Accès à la gestion des ventes et des stocks.',
        ]"
        :ui="{
          featureTitle: 'text-white dark:text-black ',
          discount: 'text-white dark:text-black',
          description: 'text-white dark:text-black',
        }"
      />
    </UPageSection>

    <!-- CTA 2 -->
    <UPageCTA
      title="Prêt à transformer la gestion de votre cuisine ?"
      description="Rejoignez les chefs et gestionnaires qui ont choisi l'efficacité"
      :links="[
        {
          label: 'Commencer mon essai gratuit de 14 jours',
          color: 'neutral',
          size: 'lg',
        },
        {
          label: 'Aucune carte de crédit requise',
          size: 'sm',
          color: 'neutral',
          variant: 'ghost',
        },
      ]"
      class="text-center rounded-lg bg-primary"
      :ui="{ description: 'text-white dark:text-black' }"
    />

    <!-- Footer -->
    <UFooter :links="[]">
      <template #top>
        <div
          class="flex gap-4 flex-col md:flex-row md:justify-between w-full mb-8"
        >
          <!-- Brand -->
          <div class="col-span-2 md:col-span-1">
            <h3 class="text-lg font-bold mb-2">O-Platy60</h3>
            <p class="text-sm text-muted mb-4 text-left">
              La solution de gestion de cuisine <br />
              la plus intuitive pour les professionnels de la restauration.
            </p>
            <div class="flex gap-3">
              <UButton
                icon="i-lucide-twitter"
                color="neutral"
                variant="ghost"
                size="sm"
              />
              <UButton
                icon="i-lucide-linkedin"
                color="neutral"
                variant="ghost"
                size="sm"
              />
              <UButton
                icon="i-lucide-instagram"
                color="neutral"
                variant="ghost"
                size="sm"
              />
            </div>
          </div>

          <!-- Footer Columns - Remplace 3 divs -->
          <div class="justify-self-end">
            <UFooterColumns
              :columns="footerColumns"
              class="col-span-2 md:col-span-3"
            />
          </div>
        </div>
      </template>

      <template #left>
        <p class="text-muted text-sm">
          O-Platy60 © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <p class="text-muted text-sm md:text-end">
          Fièrement développé par les passionnés de gastronomie.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
import type { ButtonProps, FooterColumn } from "@nuxt/ui";

import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Fonctionnalités",
  },
  {
    label: "Témoignages",
  },
  {
    label: "Tarifs",
  },
]);

// Hero buttons
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

// Stats data
const grids = [
  { title: "150+", description: "Restaurants actifs" },
  { title: "15%", description: "Économies moyennes" },
  { title: "24/7", description: "Support réactif" },
  { title: "10k+", description: "Articles gérés" },
];

// Features cards
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

// Footer columns data pour UFooterColumns
const footerColumns: FooterColumn[] = [
  {
    label: "Produit",
    children: [
      { label: "Fonctionnalités", to: "/features" },
      { label: "Tarifs", to: "/pricing" },
      { label: "Démo", to: "/demo" },
      { label: "Mises à jour", to: "/updates" },
    ],
  },
  {
    label: "Ressources",
    children: [
      { label: "Blog", to: "/blog" },
      { label: "Guides", to: "/guides" },
      { label: "Centre d'aide", to: "/help" },
      { label: "API", to: "/api" },
    ],
  },
  {
    label: "Entreprise",
    children: [
      { label: "À propos", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Carrières", to: "/careers" },
      { label: "Partenaires", to: "/partners" },
    ],
  },
];
</script>
