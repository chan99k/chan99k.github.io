-- 포인트 시스템: 사용자 잔액 + 거래 이력 + RPC 함수

-- user_points: 사용자 포인트 잔액
create table user_points (
  user_id uuid references auth.users primary key,
  balance integer not null default 0,
  total_earned integer not null default 0,
  total_spent integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- point_transactions: 포인트 거래 이력
create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  amount integer not null,
  type text not null,
  reference_id uuid,
  description text,
  created_at timestamptz default now()
);

create index idx_pt_user on point_transactions (user_id, created_at desc);
create index idx_pt_type on point_transactions (type);

-- RLS
alter table user_points enable row level security;
alter table point_transactions enable row level security;

create policy "points_own_read" on user_points
  for select using (auth.uid() = user_id);

create policy "pt_own_read" on point_transactions
  for select using (auth.uid() = user_id);

-- earn_points: 원자적 포인트 적립
create or replace function earn_points(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_reference_id uuid default null,
  p_description text default null
)
returns integer
language plpgsql
security definer
as $$
declare
  new_balance integer;
begin
  insert into user_points (user_id, balance, total_earned)
  values (p_user_id, p_amount, p_amount)
  on conflict (user_id)
  do update set
    balance = user_points.balance + p_amount,
    total_earned = user_points.total_earned + p_amount,
    updated_at = now()
  returning balance into new_balance;

  insert into point_transactions (user_id, amount, type, reference_id, description)
  values (p_user_id, p_amount, p_type, p_reference_id, p_description);

  return new_balance;
end;
$$;

-- spend_points: 원자적 포인트 차감 (잔액 부족 시 -1 반환)
create or replace function spend_points(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_reference_id uuid default null,
  p_description text default null
)
returns integer
language plpgsql
security definer
as $$
declare
  current_balance integer;
  new_balance integer;
begin
  select balance into current_balance
  from user_points
  where user_id = p_user_id
  for update;

  if current_balance is null or current_balance < p_amount then
    return -1;
  end if;

  update user_points
  set balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning balance into new_balance;

  insert into point_transactions (user_id, amount, type, reference_id, description)
  values (p_user_id, -p_amount, p_type, p_reference_id, p_description);

  return new_balance;
end;
$$;

-- get_point_balance: 잔액 조회
create or replace function get_point_balance(p_user_id uuid)
returns table (balance integer, total_earned integer, total_spent integer)
language sql stable
security definer
as $$
  select balance, total_earned, total_spent
  from user_points
  where user_id = p_user_id;
$$;
