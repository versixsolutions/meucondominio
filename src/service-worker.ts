/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

// Cleanup outdated caches with error handling
try {
  cleanupOutdatedCaches()
} catch (err) {
  console.warn('Erro ao limpar caches outdated:', err)
}

// Precache and route with error handling
try {
  precacheAndRoute(self.__WB_MANIFEST)
} catch (err) {
  console.warn('Erro ao configurar precache:', err)
}

// Claim clients with error handling
try {
  self.clientsClaim()
} catch (err) {
  console.warn('Erro ao clamar clients:', err)
}

// Handler para mensagens do cliente (para atualização de SW)
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }
  } catch (err) {
    console.error('Erro ao processar SKIP_WAITING:', err)
  }
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    
    const title = data.title || 'Novo Comunicado'
    const options = {
      body: data.body || 'Você tem uma nova mensagem do condomínio.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: {
        url: data.url || '/'
      },
      vibrate: [100, 50, 100]
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  } catch (err) {
    console.error('Erro ao processar notificação push:', err)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0]
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i]
          }
        }
        return client.focus()
      }
      return self.clients.openWindow(event.notification.data.url)
    })
  )
})