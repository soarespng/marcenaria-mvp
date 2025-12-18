-- Remover políticas antigas do bucket produtos
DROP POLICY IF EXISTS "Acesso público ao bucket produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias imagens" ON storage.objects;

-- Criar políticas públicas para o bucket produtos
-- Permitir leitura pública
CREATE POLICY "Permitir leitura pública produtos"
ON storage.objects FOR SELECT
USING (bucket_id = 'produtos');

-- Permitir inserção para todos (ou apenas autenticados, se preferir)
CREATE POLICY "Permitir upload público produtos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'produtos');

-- Permitir atualização para todos
CREATE POLICY "Permitir atualização produtos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'produtos')
WITH CHECK (bucket_id = 'produtos');

-- Permitir exclusão para todos
CREATE POLICY "Permitir exclusão produtos"
ON storage.objects FOR DELETE
USING (bucket_id = 'produtos');
