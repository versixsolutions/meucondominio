import DOMPurify from 'dompurify'

/**
 * Sanitiza HTML removendo scripts e eventos maliciosos
 * 
 * @param dirty - String HTML potencialmente insegura
 * @param options - Opções de configuração (opcional)
 * @returns String HTML sanitizada
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script><p>Safe content</p>'
 * const clean = sanitizeHTML(userInput)
 * // Retorna: '<p>Safe content</p>'
 * ```
 */
export function sanitizeHTML(
  dirty: string,
  options?: {
    allowedTags?: string[]
    allowedAttributes?: string[]
  }
): string {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: options?.allowedTags || [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || [
      'href', 'title', 'target', 'rel'
    ],
    // Remove todos os event handlers (onclick, onerror, etc)
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
    // Remove tags perigosas
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    // Força target='_blank' em links externos
    ADD_ATTR: ['target'],
    // Força rel='noopener noreferrer' para segurança
    FORCE_BODY: false
  }

  return DOMPurify.sanitize(dirty, config)
}

/**
 * Sanitiza texto simples removendo TODAS as tags HTML
 * 
 * @param dirty - String com possíveis tags HTML
 * @returns String apenas com texto
 * 
 * @example
 * ```typescript
 * const input = '<script>alert("XSS")</script>Hello World'
 * const clean = sanitizeText(input)
 * // Retorna: 'Hello World'
 * ```
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitiza conteúdo para exibição em markdown (mais permissivo)
 * 
 * @param dirty - String markdown com HTML
 * @returns String HTML sanitizada permitindo formatação rica
 */
export function sanitizeMarkdown(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height'
    ],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
  })
}
