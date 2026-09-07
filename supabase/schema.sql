-- ==============================================================================
-- CosmicLens AI — Supabase Database Schema (Cosmic Vault & Profiles)
-- Execute this script in your Supabase Project SQL Editor (https://supabase.com)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Saved Charts Table (Profiles for Self, Partner, Family)
CREATE TABLE IF NOT EXISTS public.saved_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'self', -- 'self', 'partner', 'child', 'parent', 'friend'
    date_of_birth TEXT NOT NULL,
    time_of_birth TEXT NOT NULL,
    birth_city TEXT NOT NULL,
    birth_state TEXT DEFAULT '',
    birth_country TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timezone_offset_hours DOUBLE PRECISION DEFAULT 0.0,
    gender TEXT DEFAULT '',
    vedic_chart JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Saved Readings Table
CREATE TABLE IF NOT EXISTS public.saved_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chart_id UUID REFERENCES public.saved_charts(id) ON DELETE SET NULL,
    reading_payload JSONB NOT NULL,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.saved_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_readings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for saved_charts
DROP POLICY IF EXISTS "Users can view their own charts" ON public.saved_charts;
CREATE POLICY "Users can view their own charts" 
ON public.saved_charts FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own charts" ON public.saved_charts;
CREATE POLICY "Users can insert their own charts" 
ON public.saved_charts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own charts" ON public.saved_charts;
CREATE POLICY "Users can update their own charts" 
ON public.saved_charts FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own charts" ON public.saved_charts;
CREATE POLICY "Users can delete their own charts" 
ON public.saved_charts FOR DELETE 
USING (auth.uid() = user_id);

-- 6. RLS Policies for saved_readings
DROP POLICY IF EXISTS "Users can view their own readings" ON public.saved_readings;
CREATE POLICY "Users can view their own readings" 
ON public.saved_readings FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own readings" ON public.saved_readings;
CREATE POLICY "Users can insert their own readings" 
ON public.saved_readings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own readings" ON public.saved_readings;
CREATE POLICY "Users can delete their own readings" 
ON public.saved_readings FOR DELETE 
USING (auth.uid() = user_id);

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_saved_charts_user_id ON public.saved_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_readings_user_id ON public.saved_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_readings_chart_id ON public.saved_readings(chart_id);
