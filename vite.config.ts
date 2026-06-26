import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isGithubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGithubPages ? '/FIFAWorldCup/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['wc.png', 'data/worldcup-2026.json'],
      manifest: {
        name: 'World Cup Bracket',
        short_name: 'WC Bracket',
        description: 'Interactive World Cup tournament bracket and standings',
        theme_color: '#0b1a3a',
        background_color: '#060e1f',
        display: 'standalone',
        icons: [
          {
            src: '/wc.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,png}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/openfootball\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'worldcup-openfootball',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/jfjelstul\/worldcup\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'worldcup-fjelstul',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/worldcup26\.ir\/get\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'worldcup26',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
})
