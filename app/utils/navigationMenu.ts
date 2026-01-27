import type { NavigationMenuItem } from "@nuxt/ui";

export const Navitems: NavigationMenuItem[][] = [
  [
    {
      label: "Tableau de bord",
      icon: "i-lucide-layout-dashboard",
      active: true,
    },
    {
      label: "Achats",
      icon: "i-lucide-inbox",
    },
    {
      label: "Stock",
      icon: "i-lucide-box",
    },
    {
      label: "Transformations",
      icon: "i-lucide-replace-all",
    },
    {
      label: "Parametres",
      icon: "i-lucide-settings",
      defaultOpen: true,
      children: [
        {
          label: "General",
        },
        {
          label: "Members",
        },
        {
          label: "Notifications",
        },
      ],
    },
  ],
  [
    {
      label: "Feedback",
      icon: "i-lucide-message-circle",
      to: "https://github.com/nuxt-ui-templates/dashboard",
      target: "_blank",
    },
    {
      label: "Help & Support",
      icon: "i-lucide-info",
      to: "https://github.com/nuxt/ui",
      target: "_blank",
    },
  ],
];
