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
      label: "Achats",
      icon: "i-lucide-inbox",
      to: "/purchases",
    },
    {
      label: "Inventaire",
      icon: "i-lucide-package",
      to: "/inventory",
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
      to: "https://github.com/nuxt/ui",
      target: "_blank",
    },
  ],
];
