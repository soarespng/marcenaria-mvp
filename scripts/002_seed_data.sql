-- Inserir dados de exemplo para produtos (requer usuário autenticado)
-- Nota: Este script deve ser executado depois de fazer login

INSERT INTO produtos (nome, descricao, preco, estoque) VALUES
  ('Notebook Dell', 'Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD', 3499.90, 15),
  ('Mouse Logitech', 'Mouse sem fio Logitech M185, Conexão USB', 89.90, 50),
  ('Teclado Mecânico', 'Teclado Mecânico RGB, Switch Blue, ABNT2', 299.90, 30),
  ('Monitor LG 24"', 'Monitor LG 24" Full HD IPS, 75Hz', 799.90, 20),
  ('Webcam HD', 'Webcam Full HD 1080p com microfone integrado', 199.90, 40);

INSERT INTO contatos (nome, email, mensagem) VALUES
  ('João Silva', 'joao@email.com', 'Gostaria de mais informações sobre os produtos'),
  ('Maria Santos', 'maria@email.com', 'Quando terão promoções?'),
  ('Pedro Costa', 'pedro@email.com', 'Excelente atendimento, parabéns!'),
  ('Ana Paula', 'ana@email.com', 'Como faço para rastrear meu pedido?');
