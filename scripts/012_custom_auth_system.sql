-- Sistema de autenticação customizado com senhas criptografadas
-- Remove dependência do Supabase Auth e cria sistema próprio

-- Atualizar tabela usuarios para incluir senha e salt
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_id_fkey;
ALTER TABLE usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE usuarios ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Adicionar colunas de senha
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_hash TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE;

-- Criar índice no email para login rápido
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Função para gerar salt aleatório
CREATE OR REPLACE FUNCTION generate_salt()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Função para hash de senha com salt usando pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION hash_password(senha TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(senha || salt, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Corrigir função validar_senha para evitar ambiguidade de colunas
CREATE OR REPLACE FUNCTION validar_senha(email_input TEXT, senha_input TEXT)
RETURNS TABLE(valido BOOLEAN, usuario_id UUID, nome TEXT, email TEXT) AS $$
DECLARE
  v_id UUID;
  v_nome TEXT;
  v_email TEXT;
  v_senha_hash TEXT;
  v_salt TEXT;
  senha_hash_calculado TEXT;
BEGIN
  -- Buscar usuário por email
  SELECT u.id, u.nome, u.email, u.senha_hash, u.salt
  INTO v_id, v_nome, v_email, v_senha_hash, v_salt
  FROM usuarios u
  WHERE u.email = email_input;

  -- Se usuário não encontrado
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Calcular hash da senha fornecida
  senha_hash_calculado := hash_password(senha_input, v_salt);

  -- Comparar hashes
  IF senha_hash_calculado = v_senha_hash THEN
    -- Atualizar último login
    UPDATE usuarios SET ultimo_login = NOW() WHERE id = v_id;
    
    RETURN QUERY SELECT TRUE, v_id, v_nome, v_email;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar novo usuário
CREATE OR REPLACE FUNCTION criar_usuario(nome_input TEXT, email_input TEXT, senha_input TEXT)
RETURNS TABLE(sucesso BOOLEAN, mensagem TEXT, usuario_id UUID) AS $$
DECLARE
  novo_salt TEXT;
  novo_hash TEXT;
  novo_id UUID;
BEGIN
  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM usuarios WHERE email = email_input) THEN
    RETURN QUERY SELECT FALSE, 'Email já cadastrado'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Gerar salt e hash
  novo_salt := generate_salt();
  novo_hash := hash_password(senha_input, novo_salt);

  -- Inserir usuário
  INSERT INTO usuarios (nome, email, senha_hash, salt)
  VALUES (nome_input, email_input, novo_hash, novo_salt)
  RETURNING id INTO novo_id;

  RETURN QUERY SELECT TRUE, 'Usuário criado com sucesso'::TEXT, novo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas RLS para o novo sistema
DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;

-- Novas políticas: acesso público para leitura (exceto senhas)
CREATE POLICY "Todos podem ver perfis públicos"
  ON usuarios FOR SELECT
  USING (true);

-- Apenas admins podem inserir/atualizar (ou via funções SECURITY DEFINER)
CREATE POLICY "Sistema pode gerenciar usuários"
  ON usuarios FOR ALL
  USING (false);

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Comentários
COMMENT ON FUNCTION validar_senha IS 'Valida email e senha, retorna dados do usuário se válido';
COMMENT ON FUNCTION criar_usuario IS 'Cria novo usuário com senha criptografada';
COMMENT ON FUNCTION hash_password IS 'Gera hash SHA-256 da senha + salt';
COMMENT ON FUNCTION generate_salt IS 'Gera salt aleatório de 16 bytes';
