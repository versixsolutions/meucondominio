// Proxy function to forward requests to ask-ai
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://versixnorma.com.br",
  "https://www.versixnorma.com.br",
  "https://app.versixnorma.com.br",
  "https://app.versiximobina.com.br",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "3600",
    "Content-Type": "application/json",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin") || undefined;
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    // Preflight response
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Build target ask-ai URL on same project
    const supabaseBase = `${url.protocol}//${url.host}`;
    const target = `${supabaseBase}/functions/v1/ask-ai`;

    const forwardResp = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    const bodyText = await forwardResp.text();
    return new Response(bodyText, {
      status: forwardResp.status,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response(
      JSON.stringify({
        answer:
          "Falha ao encaminhar requisição para o assistente. Tente novamente.",
        sources: [],
      }),
      { status: 502, headers: corsHeaders },
    );
  }
});
