// src/lib/metrics.ts
// Sistema de métricas customizadas para monitoramento de performance e uso

interface MetricEvent {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

class MetricsCollector {
  private buffer: MetricEvent[] = []
  private flushInterval: number = 30000 // 30 segundos
  private maxBufferSize: number = 100
  private flushTimer?: number

  constructor() {
    // Flush periódico
    this.flushTimer = window.setInterval(() => this.flush(), this.flushInterval)
    
    // Flush ao sair da página
    window.addEventListener('beforeunload', () => this.flush())
    
    // Flush quando buffer está cheio
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush()
      }
    })
  }

  /**
   * Registra uma métrica genérica
   */
  record(name: string, value: number, tags?: Record<string, string>) {
    this.buffer.push({
      name,
      value,
      tags,
      timestamp: Date.now()
    })

    // Auto-flush se buffer estiver muito grande
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush()
    }
  }

  /**
   * Métricas de Chatbot
   */
  recordChatbotQuery(responseTimeMs: number, success: boolean, searchType: string) {
    this.record('chatbot.query', 1, {
      success: String(success),
      search_type: searchType
    })
    
    this.record('chatbot.response_time', responseTimeMs, {
      search_type: searchType
    })
  }

  /**
   * Métricas de Page Load
   */
  recordPageLoad(pageName: string, loadTimeMs: number) {
    this.record('page.load_time', loadTimeMs, { 
      page: pageName 
    })
  }

  /**
   * Métricas de API Calls
   */
  recordApiCall(endpoint: string, durationMs: number, status: number) {
    this.record('api.call', 1, {
      endpoint,
      status: String(status),
      success: String(status < 400)
    })
    
    this.record('api.duration', durationMs, { 
      endpoint 
    })
  }

  /**
   * Métricas de Web Vitals
   */
  recordWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    this.record(`web_vital.${name}`, value, { rating })
  }

  /**
   * Métricas de Engagement
   */
  recordUserAction(action: string, category: string) {
    this.record('user.action', 1, {
      action,
      category
    })
  }

  /**
   * Métricas de Erros
   */
  recordError(errorType: string, severity: 'low' | 'medium' | 'high') {
    this.record('error.count', 1, {
      type: errorType,
      severity
    })
  }

  /**
   * Enviar métricas para backend
   */
  private async flush() {
    if (this.buffer.length === 0) return

    const metrics = [...this.buffer]
    this.buffer = []

    try {
      // Usar sendBeacon se disponível (mais confiável no beforeunload)
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ metrics })], {
          type: 'application/json'
        })
        
        navigator.sendBeacon('/api/metrics', blob)
      } else {
        // Fallback para fetch
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics }),
          keepalive: true // Permite envio mesmo se página está fechando
        })
      }
      
      console.debug(`📊 ${metrics.length} métricas enviadas`)
    } catch (error) {
      console.warn('⚠️ Falha ao enviar métricas:', error)
      // Re-adicionar ao buffer para próxima tentativa
      this.buffer.push(...metrics.slice(0, 50)) // Limitar a 50 para não crescer infinitamente
    }
  }

  /**
   * Cleanup ao destruir
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Singleton instance
export const metrics = new MetricsCollector()

// ═══════════════════════════════════════════════════════════════
// WEB VITALS INTEGRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Integração com Web Vitals (CLS, FID, LCP, FCP, TTFB)
 * Usar com: npm install web-vitals
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return

  try {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
      onCLS((metric) => {
        metrics.recordWebVital('cls', metric.value, metric.rating)
      })

      onFID((metric) => {
        metrics.recordWebVital('fid', metric.value, metric.rating)
      })

      onLCP((metric) => {
        metrics.recordWebVital('lcp', metric.value, metric.rating)
      })

      onFCP((metric) => {
        metrics.recordWebVital('fcp', metric.value, metric.rating)
      })

      onTTFB((metric) => {
        metrics.recordWebVital('ttfb', metric.value, metric.rating)
      })

      console.log('✅ Web Vitals tracking iniciado')
    }).catch(() => {
      console.debug('ℹ️ Web Vitals não disponível')
    })
  } catch (err) {
    console.debug('ℹ️ Web Vitals não disponível')
  }
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE OBSERVER (NAVIGATION TIMING)
// ═══════════════════════════════════════════════════════════════

export function observePageLoad() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          
          metrics.recordPageLoad(
            window.location.pathname,
            navEntry.loadEventEnd - navEntry.fetchStart
          )

          // Métricas detalhadas
          metrics.record('page.dns_time', navEntry.domainLookupEnd - navEntry.domainLookupStart)
          metrics.record('page.connection_time', navEntry.connectEnd - navEntry.connectStart)
          metrics.record('page.response_time', navEntry.responseEnd - navEntry.requestStart)
          metrics.record('page.dom_processing', navEntry.domComplete - navEntry.domLoading)
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
  } catch (err) {
    console.debug('ℹ️ Performance Observer não disponível')
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER PARA MEDIR DURAÇÃO DE FUNÇÕES
// ═══════════════════════════════════════════════════════════════

export function measureAsync<T>(
  fn: () => Promise<T>,
  metricName: string,
  tags?: Record<string, string>
): Promise<T> {
  const start = performance.now()
  
  return fn().then(
    (result) => {
      const duration = performance.now() - start
      metrics.record(metricName, duration, { ...tags, success: 'true' })
      return result
    },
    (error) => {
      const duration = performance.now() - start
      metrics.record(metricName, duration, { ...tags, success: 'false' })
      throw error
    }
  )
}

export default metrics
