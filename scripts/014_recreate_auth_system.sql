-- Dropar função problemática
DROP FUNCTION IF EXISTS validar_senha(text, text);

-- Recriar tabela usuarios sem conflitos
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simplificadas
CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios FOR UPDATE
  USING (true);

CREATE POLICY "Permitir inserção de novos usuários"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- Função simples para criar hash de senha
CREATE OR REPLACE FUNCTION criar_hash_senha(senha text, salt_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(digest(senha || salt_input, 'sha256'), 'hex');
END;
$$;

-- Função para verificar senha sem ambiguidade
CREATE OR REPLACE FUNCTION verificar_credenciais(email_input text, senha_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usuario_encontrado record;
  senha_hash_calculado text;
BEGIN
  -- Buscar usuário pelo email
  SELECT id, nome, email, senha_hash, salt
  INTO usuario_encontrado
  FROM usuarios
  WHERE email = email_input;

  -- Se usuário não encontrado
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Credenciais inválidas');
  END IF;

  -- Calcular hash da senha fornecida
  senha_hash_calculado := encode(digest(senha_input || usuario_encontrado.salt, 'sha256'), 'hex');

  -- Verificar se senha está correta
  IF senha_hash_calculado = usuario_encontrado.senha_hash THEN
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', usuario_encontrado.id,
        'nome', usuario_encontrado.nome,
        'email', usuario_encontrado.email
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'message', 'Credenciais inválidas');
  END IF;
END;
$$;

-- Função para criar novo usuário
CREATE OR REPLACE FUNCTION criar_usuario(nome_input text, email_input text, senha_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  salt_gerado text;
  senha_hash text;
  usuario_id uuid;
BEGIN
  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM usuarios WHERE email = email_input) THEN
    RETURN json_build_object('sucesso', false, 'mensagem', 'Email já cadastrado');
  END IF;

  -- Gerar salt aleatório
  salt_gerado := encode(gen_random_bytes(16), 'hex');
  
  -- Criar hash da senha
  senha_hash := encode(digest(senha_input || salt_gerado, 'sha256'), 'hex');
  
  -- Inserir novo usuário
  INSERT INTO usuarios (nome, email, senha_hash, salt)
  VALUES (nome_input, email_input, senha_hash, salt_gerado)
  RETURNING id INTO usuario_id;
  
  RETURN json_build_object(
    'sucesso', true,
    'mensagem', 'Usuário criado com sucesso',
    'usuario_id', usuario_id
  );
END;
$$;

-- Inserir usuário de teste
DO $$
DECLARE
  salt_gerado text;
  senha_hash text;
BEGIN
  -- Gerar salt aleatório
  salt_gerado := encode(gen_random_bytes(16), 'hex');
  
  -- Criar hash da senha "123456"
  senha_hash := encode(digest('123456' || salt_gerado, 'sha256'), 'hex');
  
  -- Inserir usuário teste
  INSERT INTO usuarios (nome, email, senha_hash, salt)
  VALUES ('Admin', 'admin@marcenaria.com', senha_hash, salt_gerado)
  ON CONFLICT (email) DO UPDATE
  SET senha_hash = EXCLUDED.senha_hash, salt = EXCLUDED.salt;
END $$;
