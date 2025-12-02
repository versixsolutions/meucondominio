-- Create table for cached FAQ embeddings
CREATE TABLE IF NOT EXISTS public.faqs_vectors (
  faq_id uuid PRIMARY KEY,
  condominio_id uuid NOT NULL,
  embedding double precision[] NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_faqs_vectors_condominio ON public.faqs_vectors (condominio_id);

-- RLS: allow read for anon/authenticated; write restricted to service role via PostgREST disabled for anon
ALTER TABLE public.faqs_vectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faqs_vectors read" ON public.faqs_vectors;
CREATE POLICY "faqs_vectors read" ON public.faqs_vectors FOR SELECT TO anon, authenticated USING (true);

-- Optional: restrict insert/update to service role by using Postgres function route (handled by script using service key)
