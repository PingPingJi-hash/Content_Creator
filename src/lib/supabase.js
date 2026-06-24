import { createClient } from '@supabase/supabase-js';

// User will need to provide these in Vercel / .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/*
  Instructions for Supabase DB setup (V2):
  CREATE TABLE content_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      idea TEXT NOT NULL,
      topic TEXT NOT NULL,
      captions JSONB NOT NULL,
      master_prompt TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Draft',
      image_url TEXT,
      target_audience TEXT,
      cta TEXT,
      metrics JSONB DEFAULT '{}'::jsonb,
      comments JSONB DEFAULT '[]'::jsonb,
      user_id UUID REFERENCES auth.users(id)
  );
  
  -- RLS Policies (For internal use, you can allow authenticated users)
  ALTER TABLE content_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow authenticated read" ON content_logs FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "Allow authenticated insert" ON content_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "Allow authenticated update" ON content_logs FOR UPDATE USING (auth.role() = 'authenticated');
*/
