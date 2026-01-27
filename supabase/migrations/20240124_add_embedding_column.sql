-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add embedding column to documents_geral table
-- standard OpenAI embedding size is 1536
alter table public.documents_geral 
add column if not exists embedding vector(1536);

-- Add an index for better search performance
create index if not exists documents_geral_embedding_idx 
on public.documents_geral 
using hnsw (embedding vector_cosine_ops);
