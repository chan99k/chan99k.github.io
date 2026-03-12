-- Add content_hash column for incremental sync
-- This allows detecting changed content without re-embedding unchanged posts

-- Add content_hash to blog_embeddings
alter table blog_embeddings
add column if not exists content_hash text;

-- Add index for faster lookup
create index if not exists idx_blog_embeddings_slug_hash
on blog_embeddings (slug, content_hash);

-- Add content_hash to question_embeddings
alter table question_embeddings
add column if not exists content_hash text;

-- Add index for faster lookup
create index if not exists idx_question_embeddings_slug_hash
on question_embeddings (question_slug, content_hash);

-- Add comment for documentation
comment on column blog_embeddings.content_hash is 'SHA-256 hash of content for incremental sync';
comment on column question_embeddings.content_hash is 'SHA-256 hash of content for incremental sync';
