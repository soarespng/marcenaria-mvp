-- Remover políticas de SELECT que exigem autenticação
DROP POLICY IF EXISTS "Usuários autenticados podem ver produtos" ON produtos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver contatos" ON contatos;

-- Criar políticas que permitem leitura pública
CREATE POLICY "Qualquer pessoa pode ver produtos"
ON produtos FOR SELECT
TO public
USING (true);

CREATE POLICY "Qualquer pessoa pode ver contatos"
ON contatos FOR SELECT
TO public
USING (true);

-- Manter as políticas de modificação apenas para usuários autenticados
-- (INSERT, UPDATE, DELETE já existem e estão corretas)
