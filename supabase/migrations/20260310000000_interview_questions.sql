-- 002_interview_questions.sql
-- 면접 질문 은행 스키마

create table interview_questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,                          -- 질문 제목
  question text not null,                       -- 질문 본문
  answer text,                                  -- 모범 답안 (optional)
  explanation text,                             -- 해설
  category text not null default 'general',     -- java, spring, database, network, os, design-pattern, architecture, etc.
  difficulty text not null default 'junior',    -- junior, mid, senior
  tags text[] default '{}',                     -- 태그 배열
  source text default 'curated',               -- curated, community, imported
  hints text[] default '{}',                    -- 힌트 키워드
  related_posts text[] default '{}',            -- 관련 블로그 slug
  is_active boolean default true,               -- 활성/비활성
  created_by uuid references auth.users,        -- 작성자
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인덱스
create index idx_questions_category on interview_questions (category);
create index idx_questions_difficulty on interview_questions (difficulty);
create index idx_questions_tags on interview_questions using gin (tags);
create index idx_questions_active on interview_questions (is_active) where is_active = true;

-- RLS
alter table interview_questions enable row level security;

-- 모든 인증 사용자가 활성 질문 읽기 가능
create policy "questions_read" on interview_questions
  for select using (is_active = true);

-- 작성자만 자기 질문 수정/삭제
create policy "questions_owner_write" on interview_questions
  for all using (auth.uid() = created_by);

-- 관리자(service_role)는 모든 작업 가능 (Netlify Function에서 사용)
