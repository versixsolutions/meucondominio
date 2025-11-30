/**
 * SKIP LINKS - Navegação Rápida
 * Permite usuários de teclado/screen reader pular para conteúdo principal
 */

import { useEffect, useState } from 'react'

interface SkipLink {
  href: string
  label: string
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Ir para conteúdo principal' },
  { href: '#navigation', label: 'Ir para navegação' },
  { href: '#footer', label: 'Ir para rodapé' },
]

export default function SkipLinks() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Mostra skip links ao pressionar Tab
      if (e.key === 'Tab') {
        setIsVisible(true)
      }
    }

    function handleBlur() {
      // Esconde skip links quando perdem foco
      setTimeout(() => setIsVisible(false), 100)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <nav
      aria-label="Skip links"
      className={`skip-links ${isVisible ? 'skip-links--visible' : ''}`}
    >
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
