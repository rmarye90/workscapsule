// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt', '@vueuse/nuxt'],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
    public: {
      appName: 'Team Management App'
    }
  }
})