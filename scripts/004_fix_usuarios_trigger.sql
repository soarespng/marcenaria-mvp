-- Remover trigger e função existente se houver problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função melhorada para criar perfil de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo usuário na tabela usuarios
  INSERT INTO public.usuarios (id, nome, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha o cadastro
    RAISE WARNING 'Erro ao criar perfil do usuário: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permitir que o serviço insira dados na tabela usuarios
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;

-- Atualizar políticas RLS para permitir que usuários vejam e atualizem seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Service role pode inserir usuários" ON public.usuarios;

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role pode inserir usuários"
  ON public.usuarios
  FOR INSERT
  WITH CHECK (true);

-- Sincronizar usuários existentes em auth.users que não têm perfil
INSERT INTO public.usuarios (id, nome, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'nome', split_part(au.email, '@', 1)),
  au.email,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.usuarios u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
