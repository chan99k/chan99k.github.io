-- 크라우드소싱: 사용자 기출문제 제출 테이블

create table submitted_questions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid references auth.users not null,
  question text not null,
  difficulty text not null default 'junior',
  company_name text,
  is_anonymous boolean default true,
  status text not null default 'pending',
  -- embedding processing results
  auto_category text,
  normalized_company text,
  similarity_score real,
  similar_question_id uuid references interview_questions,
  -- review info
  reviewed_by uuid references auth.users,
  reviewed_at timestamptz,
  reject_reason text,
  approved_question_id uuid references interview_questions,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sq_status on submitted_questions (status);
create index idx_sq_submitter on submitted_questions (submitter_id);

alter table submitted_questions enable row level security;

create policy "sq_own_read" on submitted_questions
  for select using (auth.uid() = submitter_id);

create policy "sq_insert" on submitted_questions
  for insert with check (auth.uid() = submitter_id);
