-- Script para adicionar URLs de imagens de exemplo aos produtos
-- Estas imagens são placeholders que podem ser substituídas por uploads reais

-- Limpar imagens antigas
DELETE FROM produto_imagens;

-- Adicionar múltiplas imagens para cada produto existente

-- Mesa de Jantar Rústica (assumindo que existe)
INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 0
FROM produtos WHERE nome LIKE '%Mesa de Jantar%' LIMIT 1;

INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 1
FROM produtos WHERE nome LIKE '%Mesa de Jantar%' LIMIT 1;

INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 2
FROM produtos WHERE nome LIKE '%Mesa de Jantar%' LIMIT 1;

-- Cadeira Colonial (assumindo que existe)
INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 0
FROM produtos WHERE nome LIKE '%Cadeira%' LIMIT 1;

INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 1
FROM produtos WHERE nome LIKE '%Cadeira%' LIMIT 1;

-- Estante Modular (assumindo que existe)
INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 0
FROM produtos WHERE nome LIKE '%Estante%' LIMIT 1;

INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 1
FROM produtos WHERE nome LIKE '%Estante%' LIMIT 1;

INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800', 2
FROM produtos WHERE nome LIKE '%Estante%' LIMIT 1;

-- Adicionar imagens para outros produtos
INSERT INTO produto_imagens (produto_id, url, ordem)
SELECT id, '/placeholder.svg?height=800&width=800&query=' || nome || ' madeira artesanal', 0
FROM produtos 
WHERE NOT EXISTS (
  SELECT 1 FROM produto_imagens WHERE produto_imagens.produto_id = produtos.id
);
