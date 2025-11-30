# GitHub Actions Secrets Required

Este projeto requer os seguintes secrets configurados no GitHub:

## Vercel Deployment
- `VERCEL_TOKEN` - Token de acesso do Vercel
- `VERCEL_ORG_ID` - ID da organização Vercel
- `VERCEL_PROJECT_ID` - ID do projeto Vercel

## Supabase
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

## Sentry (Opcional)
- `SENTRY_AUTH_TOKEN` - Token de autenticação Sentry
- `SENTRY_ORG` - Nome da organização Sentry
- `SENTRY_PROJECT` - Nome do projeto Sentry

## Codecov (Opcional)
- `CODECOV_TOKEN` - Token para upload de coverage

## Como configurar:
1. Acesse: https://github.com/versixsolutions/norma/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione cada secret acima com seus respectivos valores
