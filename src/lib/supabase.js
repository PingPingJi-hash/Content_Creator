import { createClient } from '@supabase/supabase-js';

// User will need to provide these in Vercel / .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/*
  Instructions for Supabase DB setup:
  Create a table named "content_logs" with the following columns:
  - id: uuid (primary key, default gen_random_uuid())
  - created_at: timestampz (default now())
  - idea: text
  - topic: text
  - captions: jsonb (stores the platforms and text)
  - master_prompt: text
  - status: varchar (e.g., 'Draft', 'Ready', 'Published') default 'Draft'
*/
