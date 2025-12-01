// supabase/functions/health/index.ts
// Health check endpoint para monitoramento de todos os serviços

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const startTime = Date.now()
  
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {}

  // ═══════════════════════════════════════════════════════════════
  // 1. VERIFICAR SUPABASE DATABASE
  // ═══════════════════════════════════════════════════════════════
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )
    
    const dbStart = Date.now()
    const { error } = await supabase.from('users').select('id').limit(1)
    
    checks.database = {
      status: error ? 'unhealthy' : 'healthy',
      latency: Date.now() - dbStart,
      error: error?.message
    }
  } catch (e) {
    checks.database = { 
      status: 'unhealthy', 
      error: e instanceof Error ? e.message : String(e) 
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. VERIFICAR QDRANT (VECTOR DB)
  // ═══════════════════════════════════════════════════════════════
  try {
    const qdrantStart = Date.now()
    const qdrantUrl = Deno.env.get('QDRANT_URL')
    const qdrantKey = Deno.env.get('QDRANT_API_KEY')
    
    if (!qdrantUrl || !qdrantKey) {
      checks.qdrant = { status: 'not_configured' }
    } else {
      const resp = await fetch(`${qdrantUrl}/collections`, {
        headers: { 'api-key': qdrantKey }
      })
      
      checks.qdrant = {
        status: resp.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - qdrantStart,
        error: resp.ok ? undefined : `HTTP ${resp.status}`
      }
    }
  } catch (e) {
    checks.qdrant = { 
      status: 'unhealthy', 
      error: e instanceof Error ? e.message : String(e) 
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. VERIFICAR GROQ (LLM)
  // ═══════════════════════════════════════════════════════════════
  try {
    const groqStart = Date.now()
    const groqKey = Deno.env.get('GROQ_API_KEY')
    
    if (!groqKey) {
      checks.groq = { status: 'not_configured' }
    } else {
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      checks.groq = {
        status: resp.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - groqStart,
        error: resp.ok ? undefined : `HTTP ${resp.status}`
      }
    }
  } catch (e) {
    checks.groq = { 
      status: 'unhealthy', 
      error: e instanceof Error ? e.message : String(e) 
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. VERIFICAR HUGGINGFACE (EMBEDDINGS)
  // ═══════════════════════════════════════════════════════════════
  try {
    const hfStart = Date.now()
    const hfToken = Deno.env.get('HUGGINGFACE_TOKEN')
    
    if (!hfToken) {
      checks.huggingface = { status: 'not_configured' }
    } else {
      const resp = await fetch(
        'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
        { 
          headers: { 
            'Authorization': `Bearer ${hfToken}` 
          } 
        }
      )
      
      checks.huggingface = {
        status: resp.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - hfStart,
        error: resp.ok ? undefined : `HTTP ${resp.status}`
      }
    }
  } catch (e) {
    checks.huggingface = { 
      status: 'unhealthy', 
      error: e instanceof Error ? e.message : String(e) 
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. DETERMINAR STATUS GERAL
  // ═══════════════════════════════════════════════════════════════
  const healthyCount = Object.values(checks).filter(c => c.status === 'healthy').length
  const totalConfigured = Object.values(checks).filter(c => c.status !== 'not_configured').length
  const allHealthy = healthyCount === totalConfigured && totalConfigured > 0

  const totalLatency = Date.now() - startTime

  const response = {
    status: allHealthy ? 'healthy' : (healthyCount > 0 ? 'degraded' : 'unhealthy'),
    timestamp: new Date().toISOString(),
    totalLatency,
    healthy: healthyCount,
    total: totalConfigured,
    checks
  }

  console.log(`🏥 Health check: ${response.status} (${healthyCount}/${totalConfigured} healthy, ${totalLatency}ms)`)

  return new Response(
    JSON.stringify(response, null, 2),
    {
      status: allHealthy ? 200 : 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  )
})
