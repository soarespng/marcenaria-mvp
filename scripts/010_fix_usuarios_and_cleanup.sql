-- Script para corrigir trigger de usuários e limpar dados
-- Execute este script para resolver problemas de duplicação

-- 1. Remover trigger antiga
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar função melhorada que evita duplicação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir perfil apenas se não existir
  INSERT INTO public.usuarios (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING; -- Evita erro de duplicação
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Sincronizar usuários existentes (criar perfis que faltam)
INSERT INTO public.usuarios (id, email, nome)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN public.usuarios p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Script auxiliar para limpar todos os usuários (USE COM CUIDADO!)
-- Descomente as linhas abaixo APENAS se quiser limpar tudo e começar do zero:
-- DELETE FROM public.usuarios;
-- DELETE FROM auth.users;
