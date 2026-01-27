import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    buildAssetsDir: "/_nuxt/",
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:8000/v1",
    },
  },

  // Ensure the module is properly initialized
  modules: ["@nuxt/ui", "@pinia/nuxt"],

  devtools: {
    enabled: true,
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: "2025-01-15",
});
