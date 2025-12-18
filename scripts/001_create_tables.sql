-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10, 2) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de contatos
CREATE TABLE IF NOT EXISTS contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos (permitir todas as operações para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver produtos"
  ON produtos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar produtos"
  ON produtos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON produtos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir produtos"
  ON produtos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Políticas RLS para contatos (permitir todas as operações para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver contatos"
  ON contatos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar contatos"
  ON contatos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir contatos"
  ON contatos FOR DELETE
  USING (auth.uid() IS NOT NULL);
