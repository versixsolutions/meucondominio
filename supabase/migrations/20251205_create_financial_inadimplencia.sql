-- Create table to registrar inadimplência mensal e total por condomínio
create table if not exists public.financial_inadimplencia (
    id uuid primary key default gen_random_uuid(),
    condominio_id uuid not null,
    reference_month text not null,
    inadimplencia_mes numeric(6,3),
    inadimplencia_total numeric(6,3),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Garantir unicidade por condomínio e mês
create unique index if not exists financial_inadimplencia_condominio_month_idx
    on public.financial_inadimplencia (condominio_id, reference_month);
