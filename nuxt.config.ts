import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    buildAssetsDir: "/_nuxt/",
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_URL,
      smtpServer: process.env.SMTP_SERVER,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USERNAME,
      smtpPassword: process.env.SMTP_PASSWORD,
    },
  },

  // Ensure the module is properly initialized
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "nuxt-charts",
  ],
  devtools: {
    enabled: true,
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: "2025-01-15",
});
