import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setShowBanner(false)
    }

    setInstallPrompt(null)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-2xl p-4 z-50 animate-bounce">
      <div className="flex items-start gap-3">
        <div className="text-3xl">📱</div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Instalar Condomix</h3>
          <p className="text-sm text-purple-100 mb-3">
            Adicione à tela inicial para acesso rápido!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="bg-white/20 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/30 transition"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
