-- 001_initial_schema.sql
-- RAG 기반 모의면접 스키마 (Supabase SQL Editor에서 실행)

-- Enable pgvector
create extension if not exists vector;

-- Blog embeddings
create table blog_embeddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  chunk_text text not null,
  chunk_index integer not null default 0,
  embedding vector(384),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on blog_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 10);
create index on blog_embeddings (slug);

-- Question embeddings
create table question_embeddings (
  id uuid primary key default gen_random_uuid(),
  question_slug text not null,
  title text not null,
  chunk_text text not null,
  chunk_type text not null default 'question',
  embedding vector(384),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on question_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 10);
create index on question_embeddings (question_slug);

-- Sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  status text not null default 'active',
  initial_question text,
  total_score integer,
  feedback jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index on sessions (user_id, status);

-- Session messages
create table session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete cascade not null,
  depth integer not null default 0,
  role text not null,
  content text not null,
  message_type text not null,
  interviewer text,
  related_chunks jsonb,
  score jsonb,
  created_at timestamptz default now(),
  ordering integer not null default 0
);

create index on session_messages (session_id, ordering);

-- User profiles
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique not null,
  display_name text,
  target_role text default 'developer',
  weak_areas jsonb default '[]',
  strong_areas jsonb default '[]',
  total_sessions integer default 0,
  avg_score real default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table blog_embeddings enable row level security;
alter table question_embeddings enable row level security;
alter table sessions enable row level security;
alter table session_messages enable row level security;
alter table user_profiles enable row level security;

-- Public read for embeddings
create policy "embeddings_public_read" on blog_embeddings for select using (true);
create policy "question_embeddings_public_read" on question_embeddings for select using (true);

-- Sessions: own only
create policy "sessions_own" on sessions for all using (auth.uid() = user_id);

-- Session messages: own session only
create policy "messages_own" on session_messages for all
  using (session_id in (select id from sessions where user_id = auth.uid()));

-- User profiles: own only
create policy "profiles_own" on user_profiles for all using (auth.uid() = user_id);

-- Similarity search function
create or replace function search_similar_chunks(
  query_embedding vector(384),
  match_count integer default 5,
  match_threshold real default 0.7
)
returns table (
  id uuid,
  slug text,
  title text,
  chunk_text text,
  similarity real,
  source text
)
language sql stable
as $$
  select id, slug, title, chunk_text,
    1 - (embedding <=> query_embedding) as similarity,
    'blog' as source
  from blog_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  union all
  select id, question_slug as slug, title, chunk_text,
    1 - (embedding <=> query_embedding) as similarity,
    'question' as source
  from question_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
