// Importações usando o mapa definido em deno.json
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:admin@versix.com.br',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )
  } catch (err) {
    console.error('Erro ao configurar VAPID:', err)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const comunicado = payload.record

    if (!comunicado) {
      throw new Error('Nenhum registro de comunicado encontrado no payload.')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    console.log(`📢 Processando notificação para comunicado: ${comunicado.title}`)

    const { data: users, error: usersError } = await supabase.from('users').select('id, email, full_name')
    if (usersError) console.error('Erro ao buscar usuários:', usersError)

    const { data: subscriptions, error: subsError } = await supabase.from('push_subscriptions').select('subscription, user_id')
    if (subsError) console.error('Erro ao buscar subscrições:', subsError)

    if (RESEND_API_KEY && users) {
      const emailPromises = users.map(u => {
        if (!u.email) return Promise.resolve()
        
        return fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Versix Condomínio <onboarding@resend.dev>',
            to: [u.email],
            subject: `Novo Comunicado: ${comunicado.title}`,
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h1>Olá, ${u.full_name || 'Morador'}</h1>
                <p>Um novo comunicado foi publicado no mural do condomínio.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00A86B;">
                  <h2 style="margin-top:0; color: #00A86B;">${comunicado.title}</h2>
                  <p style="white-space: pre-line;">${comunicado.content}</p>
                </div>
                <p><a href="https://app.versix.com.br" style="background-color: #00A86B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar App</a></p>
              </div>
            `
          })
        }).catch(err => console.error(`Erro email para ${u.email}:`, err))
      })
      
      Promise.all(emailPromises).then(() => console.log(`✅ Emails processados.`))
    }

    if (VAPID_PRIVATE_KEY && subscriptions && subscriptions.length > 0) {
      const notificationPayload = JSON.stringify({
        title: `Condomínio: ${comunicado.title}`,
        body: comunicado.content.substring(0, 100) + (comunicado.content.length > 100 ? '...' : ''),
        url: '/comunicados'
      })

      const pushPromises = subscriptions.map(sub => {
        if (!sub.subscription || !sub.subscription.endpoint) return Promise.resolve()

        return webpush.sendNotification(sub.subscription, notificationPayload)
          .catch(async (err: any) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.log(`🗑️ Removendo subscrição inválida: ${sub.user_id}`)
              await supabase.from('push_subscriptions').delete().eq('subscription', sub.subscription)
            } else {
              console.error('Erro push:', err)
            }
          })
      })

      Promise.all(pushPromises).then(() => console.log(`✅ Pushes processados.`))
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Erro Fatal na Edge Function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})