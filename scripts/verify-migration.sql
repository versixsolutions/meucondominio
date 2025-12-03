-- Contar total de FAQs
SELECT COUNT(*) as total_faqs FROM public.faqs 
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96';

-- DistribuiÃ§Ã£o por categoria
SELECT category, COUNT(*) as count
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96'
GROUP BY category
ORDER BY count DESC;

-- Verificar metadados
SELECT 
    COUNT(*) FILTER (WHERE tags IS NOT NULL AND array_length(tags, 1) > 0) as with_tags,
    COUNT(*) FILTER (WHERE keywords IS NOT NULL AND array_length(keywords, 1) > 0) as with_keywords,
    COUNT(*) FILTER (WHERE article_reference IS NOT NULL) as with_references,
    COUNT(*) FILTER (WHERE question_variations IS NOT NULL AND array_length(question_variations, 1) > 0) as with_variations
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96';
