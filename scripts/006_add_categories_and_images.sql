-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna categoria_id na tabela produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL;

-- Criar tabela de imagens de produtos
CREATE TABLE IF NOT EXISTS produto_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_produto_imagens_produto_id ON produto_imagens(produto_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_imagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias (leitura pública, escrita autenticada)
CREATE POLICY "Todos podem ver categorias"
  ON categorias FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem criar categorias"
  ON categorias FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar categorias"
  ON categorias FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir categorias"
  ON categorias FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Políticas RLS para produto_imagens (leitura pública, escrita autenticada)
CREATE POLICY "Todos podem ver imagens de produtos"
  ON produto_imagens FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem criar imagens de produtos"
  ON produto_imagens FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar imagens de produtos"
  ON produto_imagens FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir imagens de produtos"
  ON produto_imagens FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Inserir categorias padrão para marcenaria
INSERT INTO categorias (nome, slug, descricao) VALUES
  ('Mesas', 'mesas', 'Mesas artesanais em diversos estilos e tamanhos'),
  ('Cadeiras', 'cadeiras', 'Cadeiras confortáveis e elegantes'),
  ('Armários', 'armarios', 'Armários planejados e sob medida'),
  ('Estantes', 'estantes', 'Estantes e prateleiras para decoração'),
  ('Portas', 'portas', 'Portas de madeira customizadas'),
  ('Outros', 'outros', 'Outros móveis e peças personalizadas')
ON CONFLICT (nome) DO NOTHING;
