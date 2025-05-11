// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image'],
  css: ['~/assets/fonts/fonts.css'],
  devServer: {
    host: "0.0.0.0",
    port: 3000, 
  },
  runtimeConfig: {
    public: {
      spotify_client_id: process.env.NUXT_SPOTIFY_CLIENT_ID,
      spotify_secret_id: process.env.NUXT_SPOTIFY_CLIENT_SECRET
    },
  },
  vite: {
    server: {
      hmr: false,
    },
  },
});