import type { NavigationMenuItem } from "@nuxt/ui";

export const Navitems: NavigationMenuItem[][] = [
  [
    {
      label: "Tableau de bord",
      icon: "i-lucide-layout-dashboard",
      to: "/dashboard",
    },
    {
      label: "Catégories",
      icon: "i-lucide-list",
      to: "/categories",
    },
    {
      label: "Details d'Achats",
      icon: "i-lucide-inbox",
      defaultOpen: true,
      children: [
        {
          label: "Ingrédient",
          to: "/ingredients",
        },
        {
          label: "Achats",
          to: "/purchases",
        },
      ],
    },
    {
      label: "Details des Inventaire",
      icon: "i-lucide-package",
      defaultOpen: true,
      children: [
        {
          label: "Produits",
          to: "/produits",
        },
        {
          label: "Inventaire",
          to: "/inventory",
        },
      ],
    },
    {
      label: "Parametres",
      icon: "i-lucide-settings",
      defaultOpen: true,
      children: [
        {
          label: "General",
          to: "/settings/general",
        },
        {
          label: "Members",
          to: "/settings/members",
        },
      ],
    },
  ],
  [
    {
      label: "Support",
      icon: "i-lucide-info",
      to: "/support",
      target: "_blank",
    },
  ],
];
