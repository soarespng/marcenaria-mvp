-- Correção da função validar_senha para resolver ambiguidade de colunas
DROP FUNCTION IF EXISTS validar_senha(TEXT, TEXT);

CREATE OR REPLACE FUNCTION validar_senha(
  email_input TEXT,
  senha_input TEXT
)
RETURNS TABLE(
  valido BOOLEAN,
  usuario_id UUID,
  nome TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    
    -- Retornar sucesso com dados do usuário
    RETURN QUERY SELECT TRUE, v_id, v_nome, v_email;
  ELSE
    -- Retornar falha
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$;
