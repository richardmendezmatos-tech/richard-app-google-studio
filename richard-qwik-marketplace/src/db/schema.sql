-- ⚡️ Richard Automotive Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable Vector Extension (for AI RAG)
create extension if not exists vector;

-- 2. Create Cars Table (Catalog)
create table cars (
  id uuid default gen_random_uuid() primary key,
  make text not null,
  model text not null,
  year int not null,
  price numeric not null,
  image_url text,
  description text,
  specs jsonb default '{}'::jsonb, -- Store dynamic specs like {"engine": "V8", "color": "Red"}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Vector Store (for Semantic Search)
create table inventory_vectors (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) on delete cascade,
  content text, -- The text representation of the car used for embedding
  embedding vector(768), -- Gemini text-embedding-004 dimension
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS) - Security First!
alter table cars enable row level security;
alter table inventory_vectors enable row level security;

-- 5. Create Policies
-- Public Read Access: Everyone can see cars
create policy "Public cars are viewable by everyone"
  on cars for select
  using ( true );

-- Admin Write Access: Only service_role (backend) can modify
-- Note: In a real app setup, you might check for specific user roles.
-- For now, we rely on the backend using the SERVICE_ROLE_KEY for writes.

-- 6. Create Search Function (RPC)
-- This allows us to search by vector similarity from the API
create or replace function search_cars(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  car_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    inventory_vectors.id,
    inventory_vectors.car_id,
    inventory_vectors.content,
    1 - (inventory_vectors.embedding <=> query_embedding) as similarity
  from inventory_vectors
  where 1 - (inventory_vectors.embedding <=> query_embedding) > match_threshold
  order by inventory_vectors.embedding <=> query_embedding
  limit match_count;
end;
$$;
