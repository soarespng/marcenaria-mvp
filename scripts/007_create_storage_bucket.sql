-- Criar bucket para imagens de produtos no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para o bucket produtos
CREATE POLICY "Todos podem ver imagens de produtos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'produtos');

CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'produtos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar imagens"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'produtos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir imagens"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'produtos' AND auth.uid() IS NOT NULL);
