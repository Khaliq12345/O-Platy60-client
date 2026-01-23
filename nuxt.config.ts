import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    buildAssetsDir: "/_nuxt/",
  },

  // Ensure the module is properly initialized
  modules: ["@nuxt/ui"],

  devtools: {
    enabled: true,
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: "2025-01-15",
});
