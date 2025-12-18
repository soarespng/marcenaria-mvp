-- Criar tabela de usuários (perfis)
-- Esta tabela armazena informações adicionais dos usuários
-- A autenticação é gerenciada automaticamente pelo Supabase Auth (auth.users)
-- As senhas são criptografadas automaticamente pelo Supabase

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
-- Usuários podem ver todos os perfis
CREATE POLICY "Usuários autenticados podem ver perfis"
  ON usuarios FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Função para criar perfil automaticamente ao criar conta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
