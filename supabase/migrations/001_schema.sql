-- Quill Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- ─────────────────────────────────────────────
-- Section 1: profiles table
-- ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text        NOT NULL,
  display_name text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Section 2: generations table
-- ─────────────────────────────────────────────
CREATE TABLE public.generations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text       text        NOT NULL,
  generation_type  text        NOT NULL,
  output_text      text        NOT NULL,
  share_id         text        UNIQUE,
  is_shared        boolean     NOT NULL DEFAULT false,
  is_public        boolean     NOT NULL DEFAULT true,
  share_expires_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generation_type_valid CHECK (
    generation_type IN ('summary', 'rewrite_professional', 'rewrite_casual', 'bullets')
  )
);

-- ─────────────────────────────────────────────
-- Section 3: Indexes
-- ─────────────────────────────────────────────
CREATE INDEX idx_generations_user_created
  ON public.generations (user_id, created_at DESC);

CREATE INDEX idx_generations_share_id
  ON public.generations (share_id)
  WHERE share_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- Section 4: Enable RLS
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Section 5: RLS Policies
-- ─────────────────────────────────────────────

-- profiles: users can only access their own row
CREATE POLICY "profiles: own row only"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- generations: owner has full access
CREATE POLICY "generations: owner full access"
  ON public.generations FOR ALL
  USING (auth.uid() = user_id);

-- generations: anyone can read a generation that is shared, public, and not expired
CREATE POLICY "generations: public shared read"
  ON public.generations FOR SELECT
  USING (
    is_shared = true
    AND is_public = true
    AND (share_expires_at IS NULL OR share_expires_at > now())
  );

-- ─────────────────────────────────────────────
-- Section 6: Auto-create profile trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
