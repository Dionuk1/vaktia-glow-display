CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Përdorues',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.sunnah_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  log_date date NOT NULL DEFAULT current_date,
  prayer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date, prayer)
);
GRANT SELECT, INSERT, DELETE ON public.sunnah_logs TO authenticated;
GRANT ALL ON public.sunnah_logs TO service_role;
ALTER TABLE public.sunnah_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs read" ON public.sunnah_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own logs insert" ON public.sunnah_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own logs delete" ON public.sunnah_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, split_part(COALESCE(NEW.email, 'Përdorues'), '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_sunnah_leaderboard(_limit int DEFAULT 20)
RETURNS TABLE (display_name text, total bigint, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.display_name, count(l.id) AS total, p.id = auth.uid()
  FROM public.profiles p JOIN public.sunnah_logs l ON l.user_id = p.id
  WHERE auth.uid() IS NOT NULL
  GROUP BY p.id, p.display_name
  ORDER BY total DESC, p.display_name
  LIMIT LEAST(GREATEST(_limit, 1), 100);
$$;
REVOKE EXECUTE ON FUNCTION public.get_sunnah_leaderboard(int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_sunnah_leaderboard(int) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.sunnah_logs;