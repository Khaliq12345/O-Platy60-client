import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    buildAssetsDir: "/_nuxt/",
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:8001/v1",
    },
  },

  // Ensure the module is properly initialized
  modules: ["@nuxt/ui", "@pinia/nuxt", "pinia-plugin-persistedstate"],

  devtools: {
    enabled: true,
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: "2025-01-15",
});
