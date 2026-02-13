-- Run this in the Supabase SQL Editor (Dashboard → SQL → New Query)
-- It creates the bookmarks table with row-level security so each user
-- can only see and manage their own bookmarks.

-- Enable the realtime extension if it isn't already
-- (Supabase turns it on by default for new projects, but just in case)
-- alter publication supabase_realtime add table bookmarks;

create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null,
  created_at timestamptz default now()
);

-- Turn on RLS
alter table public.bookmarks enable row level security;

-- Policies
create policy "Users can read their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Realtime: make sure the bookmarks table is part of the publication
alter publication supabase_realtime add table public.bookmarks;
