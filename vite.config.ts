import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // dev 환경에서도 SW 활성화 (테스트용)
      devOptions: { enabled: false },
      manifest: {
        name: '온집',
        short_name: '온집',
        description: '우리 집 생활을 한곳에. 가계부, 일정, 체크리스트, 메모장을 한 앱에서.',
        theme_color: '#ff385c',
        background_color: '#f7f7f7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ko',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // localStorage 앱이라 네트워크 요청 없음 → 앱 셸만 캐싱
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [],
      },
    }),
  ],
  server: {
    port: 3000,
  },
})
