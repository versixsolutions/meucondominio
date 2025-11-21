import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Pergunta ao usuário se quer atualizar quando houver nova versão
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Versix Meu Condomínio',
        short_name: 'Meu Condomínio',
        description: 'Gestão inteligente e transparente para seu condomínio',
        theme_color: '#00A86B', // Verde do tema Pinheiro Park
        background_color: '#ffffff',
        display: 'standalone', // Remove a barra de URL do navegador (aparência de app nativo)
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // Você precisará criar essas imagens na pasta public
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})