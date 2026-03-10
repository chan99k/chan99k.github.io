-- 서버 키 사용량 추적
create table usage_quotas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  request_count integer not null default 0,
  token_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create index idx_quotas_user_date on usage_quotas (user_id, date);

alter table usage_quotas enable row level security;
create policy "quotas_own" on usage_quotas for all using (auth.uid() = user_id);

-- 일일 쿼터 체크 + 증가 함수
create or replace function check_and_increment_quota(
  p_user_id uuid,
  p_daily_limit integer default 20
)
returns boolean
language plpgsql
as $$
declare
  current_count integer;
begin
  insert into usage_quotas (user_id, date, request_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, date)
  do update set request_count = usage_quotas.request_count + 1, updated_at = now()
  returning request_count into current_count;

  return current_count <= p_daily_limit;
end;
$$;
