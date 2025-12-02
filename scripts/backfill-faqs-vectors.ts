import "dotenv/config";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env
  .SUPABASE_SERVICE_ROLE_KEY as string;
const HUGGINGFACE_ENDPOINT_URL = process.env.HUGGINGFACE_ENDPOINT_URL as string;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN as string;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateEmbedding(text: string, retries = 5): Promise<number[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(HUGGINGFACE_ENDPOINT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        if (resp.status === 503 && attempt < retries - 1) {
          const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(
            `  ⏳ HF 503, retry ${attempt + 1}/${retries} after ${Math.round(backoff)}ms`,
          );
          await sleep(backoff);
          continue;
        }
        throw new Error(`HF error: ${errText}`);
      }
      const data = await resp.json();
      const arr = Array.isArray(data)
        ? data[0]
        : data.embeddings || data.vector || [];
      return arr.map((v: any) => Number(v));
    } catch (e) {
      if (attempt === retries - 1) throw e;
      const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.log(
        `  ⏳ Retry ${attempt + 1}/${retries} after ${Math.round(backoff)}ms`,
      );
      await sleep(backoff);
    }
  }
  throw new Error("Max retries exceeded");
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch all FAQs grouped by condominio
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id, condominio_id, question")
    .order("created_at", { ascending: true });
  if (error) throw error;

  console.log(
    `Found ${faqs?.length || 0} FAQs. Generating embeddings with rate limiting...`,
  );

  let ok = 0,
    failed = 0;
  const batchSize = 5; // Process in small batches to avoid overwhelming HF
  for (let i = 0; i < (faqs || []).length; i += batchSize) {
    const batch = (faqs || []).slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (faq) => {
        try {
          const emb = await generateEmbedding(faq.question);
          const { error: upErr } = await supabase
            .from("faqs_vectors")
            .upsert({
              faq_id: faq.id,
              condominio_id: faq.condominio_id,
              embedding: emb,
              updated_at: new Date().toISOString(),
            });
          if (upErr) throw upErr;
          ok++;
        } catch (e) {
          failed++;
          console.warn(
            `❌ FAQ ${faq.id}:`,
            e instanceof Error ? e.message : String(e),
          );
        }
      }),
    );
    if ((i + batchSize) % 25 === 0)
      console.log(`Progress: ${ok} ok, ${failed} failed`);
    await sleep(200); // Rate limit between batches
  }

  console.log(`Done. Success: ${ok}, Failed: ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
