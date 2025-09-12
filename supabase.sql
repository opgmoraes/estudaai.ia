
-- Tabela de assinaturas
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null,
  status text not null check (status in ('active','past_due','canceled','expired')),
  current_period_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.subscriptions enable row level security;

-- Políticas: cada usuário só vê a própria assinatura
create policy if not exists "read own sub"
on public.subscriptions for select
to authenticated using ( auth.uid() = user_id );

-- Opcional: evitar que cliente edite assinatura via client
create policy if not exists "no client updates"
on public.subscriptions for all
to authenticated using ( false );

-- View para o cliente consumir (somente leitura)
create or replace view public.v_my_subscription as
  select user_id, plan, status, current_period_end from public.subscriptions;

grant select on public.v_my_subscription to anon, authenticated;
