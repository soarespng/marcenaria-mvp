-- Limpar dados antigos (produtos de eletrônicos)
DELETE FROM produto_imagens;
DELETE FROM produtos;

-- Inserir produtos de marcenaria com múltiplas imagens
-- Mesa de Jantar Rústica
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Mesa de Jantar Rústica',
  'Mesa de jantar em madeira maciça com acabamento natural. Comporta 6 pessoas confortavelmente. Dimensões: 1,80m x 0,90m.',
  2850.00,
  5,
  id
FROM categorias WHERE slug = 'mesas'
RETURNING id;

-- Pegar o ID da última inserção para adicionar imagens
DO $$
DECLARE
  mesa_rustica_id uuid;
BEGIN
  SELECT id INTO mesa_rustica_id FROM produtos WHERE nome = 'Mesa de Jantar Rústica' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (mesa_rustica_id, '/placeholder.svg?height=600&width=600', 1),
    (mesa_rustica_id, '/placeholder.svg?height=600&width=600', 2),
    (mesa_rustica_id, '/placeholder.svg?height=600&width=600', 3);
END $$;

-- Cadeira Colonial
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Cadeira Colonial Estofada',
  'Cadeira com estrutura em madeira nobre e assento estofado. Design clássico com acabamento refinado. Vendida em conjunto de 4 unidades.',
  1200.00,
  20,
  id
FROM categorias WHERE slug = 'cadeiras'
RETURNING id;

DO $$
DECLARE
  cadeira_id uuid;
BEGIN
  SELECT id INTO cadeira_id FROM produtos WHERE nome = 'Cadeira Colonial Estofada' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (cadeira_id, '/placeholder.svg?height=600&width=600', 1),
    (cadeira_id, '/placeholder.svg?height=600&width=600', 2);
END $$;

-- Estante Modular
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Estante Modular Premium',
  'Estante modular em madeira de demolição, 5 prateleiras ajustáveis. Dimensões: 2,10m altura x 1,20m largura. Ideal para escritórios e salas.',
  3200.00,
  8,
  id
FROM categorias WHERE slug = 'estantes'
RETURNING id;

DO $$
DECLARE
  estante_id uuid;
BEGIN
  SELECT id INTO estante_id FROM produtos WHERE nome = 'Estante Modular Premium' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (estante_id, '/placeholder.svg?height=600&width=600', 1),
    (estante_id, '/placeholder.svg?height=600&width=600', 2),
    (estante_id, '/placeholder.svg?height=600&width=600', 3),
    (estante_id, '/placeholder.svg?height=600&width=600', 4);
END $$;

-- Aparador com Gavetas
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Aparador com 3 Gavetas',
  'Aparador em madeira maciça com 3 gavetas amplas e puxadores em metal. Perfeito para sala de estar ou corredor. Dimensões: 1,50m x 0,45m x 0,85m.',
  2400.00,
  6,
  id
FROM categorias WHERE slug = 'aparadores'
RETURNING id;

DO $$
DECLARE
  aparador_id uuid;
BEGIN
  SELECT id INTO aparador_id FROM produtos WHERE nome = 'Aparador com 3 Gavetas' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (aparador_id, '/placeholder.svg?height=600&width=600', 1),
    (aparador_id, '/placeholder.svg?height=600&width=600', 2);
END $$;

-- Mesa de Centro Industrial
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Mesa de Centro Industrial',
  'Mesa de centro com tampo em madeira de demolição e base em ferro. Estilo industrial moderno. Dimensões: 1,20m x 0,60m.',
  1800.00,
  10,
  id
FROM categorias WHERE slug = 'mesas'
RETURNING id;

DO $$
DECLARE
  mesa_centro_id uuid;
BEGIN
  SELECT id INTO mesa_centro_id FROM produtos WHERE nome = 'Mesa de Centro Industrial' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (mesa_centro_id, '/placeholder.svg?height=600&width=600', 1),
    (mesa_centro_id, '/placeholder.svg?height=600&width=600', 2),
    (mesa_centro_id, '/placeholder.svg?height=600&width=600', 3);
END $$;

-- Rack para TV
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Rack para TV Suspensa',
  'Rack suspenso em MDF com acabamento em madeira. Suporta TVs até 55 polegadas. Inclui compartimentos para equipamentos. Dimensões: 1,80m x 0,35m.',
  1650.00,
  12,
  id
FROM categorias WHERE slug = 'racks'
RETURNING id;

DO $$
DECLARE
  rack_id uuid;
BEGIN
  SELECT id INTO rack_id FROM produtos WHERE nome = 'Rack para TV Suspensa' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (rack_id, '/placeholder.svg?height=600&width=600', 1),
    (rack_id, '/placeholder.svg?height=600&width=600', 2);
END $$;

-- Escrivaninha Home Office
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Escrivaninha Home Office',
  'Mesa para escritório em madeira com 2 gavetas laterais. Design clean e funcional. Dimensões: 1,40m x 0,60m. Perfeita para home office.',
  1950.00,
  7,
  id
FROM categorias WHERE slug = 'mesas'
RETURNING id;

DO $$
DECLARE
  escrivaninha_id uuid;
BEGIN
  SELECT id INTO escrivaninha_id FROM produtos WHERE nome = 'Escrivaninha Home Office' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (escrivaninha_id, '/placeholder.svg?height=600&width=600', 1),
    (escrivaninha_id, '/placeholder.svg?height=600&width=600', 2),
    (escrivaninha_id, '/placeholder.svg?height=600&width=600', 3);
END $$;

-- Banco Artesanal
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
SELECT 
  'Banco Artesanal Tora',
  'Banco rústico feito com tora de madeira maciça. Peça única e exclusiva. Ideal para varandas e jardins. Altura: 45cm.',
  680.00,
  4,
  id
FROM categorias WHERE slug = 'cadeiras'
RETURNING id;

DO $$
DECLARE
  banco_id uuid;
BEGIN
  SELECT id INTO banco_id FROM produtos WHERE nome = 'Banco Artesanal Tora' ORDER BY created_at DESC LIMIT 1;
  
  INSERT INTO produto_imagens (produto_id, url, ordem) VALUES
    (banco_id, '/placeholder.svg?height=600&width=600', 1),
    (banco_id, '/placeholder.svg?height=600&width=600', 2);
END $$;
