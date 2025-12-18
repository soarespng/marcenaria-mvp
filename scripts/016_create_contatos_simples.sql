-- Criar nova tabela para contatos simples
CREATE TABLE IF NOT EXISTS contatos_simples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  numero text,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE contatos_simples ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura de contatos"
  ON contatos_simples FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção de contatos"
  ON contatos_simples FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de contatos"
  ON contatos_simples FOR UPDATE
  USING (true);

CREATE POLICY "Permitir exclusão de contatos"
  ON contatos_simples FOR DELETE
  USING (true);
