-- Criar tabela de configurações (singleton - apenas 1 registro)
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa text NOT NULL DEFAULT 'Minha Empresa',
  logo_url text,
  telefone text,
  endereco text,
  horario_funcionamento text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_config CHECK (id = gen_random_uuid())
);

-- Inserir configuração padrão
INSERT INTO configuracoes (nome_empresa, telefone, endereco, horario_funcionamento)
VALUES (
  'Marcenaria Silva',
  '(11) 99999-9999',
  'Rua das Madeiras, 123 - São Paulo, SP',
  'Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h'
)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura de configurações"
  ON configuracoes FOR SELECT
  USING (true);

CREATE POLICY "Permitir atualização de configurações"
  ON configuracoes FOR UPDATE
  USING (true);
